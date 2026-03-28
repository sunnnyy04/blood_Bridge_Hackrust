import { Hono } from "hono";
import { db } from "@/db/index.js";
import { user, bloodRequests } from "@/db/schema/index.js";
import { eq, and, inArray, or, isNull, lt } from "drizzle-orm";
import { twilio } from "@/lib/twilio.js";

const bloodApi = new Hono();

const bloodCompatibility: Record<string, string[]> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
};

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const MESSAGING_SERVICE_URL =
  process.env.MESSAGING_SERVICE_URL as string;

bloodApi.post("/request", async (c) => {
  try {
    const body = await c.req.json();
    const { bloodType, hospitalId, radiusKm = 5, requestType = "blood" } = body;

    if (!bloodType || !hospitalId) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const hospital = await db.query.user.findFirst({
      where: and(eq(user.id, hospitalId), eq(user.role, "hospital")),
    });

    if (!hospital) {
      return c.json({ error: "Hospital not found" }, 404);
    }

    if (!hospital.latitude || !hospital.longitude) {
      return c.json({ error: "Hospital location not set" }, 400);
    }

    const hospitalLat = parseFloat(hospital.latitude);
    const hospitalLon = parseFloat(hospital.longitude);

    const compatibleTypes = bloodCompatibility[bloodType] || [bloodType];

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const registeredDonors = await db
      .select()
      .from(user)
      .where(
        and(
          eq(user.role, "donor"),
          eq(user.isAvailable, true),
          inArray(user.bloodType, compatibleTypes as any),
          requestType === "plasma" ? eq(user.canDonatePlasma, true) : eq(user.canDonateBlood, true),
          or(
            isNull(user.lastDonatedAt),
            lt(user.lastDonatedAt, threeMonthsAgo)
          )
        ),
      );

    const nearbyRegisteredDonors = registeredDonors.filter((d) => {
      if (!d.latitude || !d.longitude) return false;
      return (
        haversineDistance(
          hospitalLat,
          hospitalLon,
          parseFloat(d.latitude),
          parseFloat(d.longitude),
        ) <= radiusKm
      );
    });

    let dbCount = 0;
    const localNearbyDonors = nearbyRegisteredDonors.map(d => ({
      id: d.id,
      name: d.name,
      bloodType: d.bloodType,
      phone: d.phone,
      latitude: d.latitude,
      longitude: d.longitude
    }));

    const typeLabel = requestType.toUpperCase();

    for (const donor of nearbyRegisteredDonors) {
      if (donor.phone) {
        try {
          await twilio.sendWhatsApp({
            to: donor.phone,
            body: `🩸 Urgent ${typeLabel} Request\n\nHospital: ${hospital.hospitalName}\nType Needed: ${bloodType} ${typeLabel}\n\nIf you are able to donate, please contact:\n📞 ${hospital.phone}\n\nThank you for being a donor!`,
          });
          dbCount++;
        } catch (err) {
          console.error(`Failed to notify registered donor ${donor.id}:`, err);
        }
      }
    }

    let govtCount = 0;
    let suggestions = [];
    let govtNearbyDonors = [];

    try {
      const messagingResponse = await fetch(`${MESSAGING_SERVICE_URL}/send-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bloodType,
          hospitalName: hospital.hospitalName,
          hospitalPhone: hospital.phone,
          latitude: hospital.latitude,
          longitude: hospital.longitude,
          radiusKm,
          requestType,
        }),
      });

      if (messagingResponse.ok) {
        const messagingResult = await messagingResponse.json();
        govtCount = messagingResult.recipientsNotified || 0;
        suggestions = messagingResult.suggestions || [];
        govtNearbyDonors = messagingResult.nearbyDonors || [];
      } else {
        console.error("Messaging service returned error:", await messagingResponse.text());
      }
    } catch (err) {
      console.error("Failed to connect to messaging service:", err);
    }

    const allNearbyDonors = [...localNearbyDonors, ...govtNearbyDonors];

    const [request] = await db
      .insert(bloodRequests)
      .values({
        id: crypto.randomUUID(),
        hospitalId,
        bloodType,
        requestType: requestType as any,
        recipientsNotified: dbCount + govtCount,
        status: "pending",
      })
      .returning();

    return c.json({
      success: true,
      request,
      notifiedCount: dbCount + govtCount,
      suggestions,
      searchRadius: radiusKm,
      nearbyDonors: allNearbyDonors
    });
  } catch (error) {
    console.error("Error in /request:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

bloodApi.post("/requests/:id/complete", async (c) => {
  try {
    const id = c.req.param("id");

    const req = await db.select().from(bloodRequests).where(eq(bloodRequests.id, id)).then(r => r[0]);

    await db
      .update(bloodRequests)
      .set({ status: "completed", assignedAt: new Date() })
      .where(eq(bloodRequests.id, id));

    if (req?.assignedDonorId) {
      await db.update(user)
        .set({ lastDonatedAt: new Date() })
        .where(eq(user.id, req.assignedDonorId));
    }

    try {
      await fetch(`${MESSAGING_SERVICE_URL}/requests/${id}/complete`, { method: "POST" });
    } catch (err) {
      console.error("Failed to notify messaging service of completion:", err);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error completing request:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

bloodApi.post("/requests/:id/cancel", async (c) => {
  try {
    const id = c.req.param("id");

    await db
      .update(bloodRequests)
      .set({ status: "cancelled" })
      .where(eq(bloodRequests.id, id));

    try {
      await fetch(`${MESSAGING_SERVICE_URL}/requests/${id}/cancel`, { method: "POST" });
    } catch (err) {
      console.error("Failed to notify messaging service of cancellation:", err);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error cancelling request:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

bloodApi.get("/requests", async (c) => {
  try {
    const response = await fetch(`${MESSAGING_SERVICE_URL}/requests`);
    if (!response.ok) throw new Error(`Messaging service error: ${response.status}`);
    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return c.json({ error: "Could not fetch requests from messaging service" }, 503);
  }
});

bloodApi.get("/requests/:id/responses", async (c) => {
  try {
    const requestId = c.req.param("id");
    const response = await fetch(
      `${MESSAGING_SERVICE_URL}/requests/${requestId}/responses`,
    );
    if (!response.ok) throw new Error(`Messaging service error: ${response.status}`);
    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error("Error fetching responses:", error);
    return c.json({ error: "Could not fetch responses from messaging service" }, 503);
  }
});

bloodApi.get("/donors/available", async (c) => {
  try {
    const response = await fetch(`${MESSAGING_SERVICE_URL}/donors/available`);
    if (!response.ok) throw new Error(`Messaging service error: ${response.status}`);
    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error("Error fetching available donors:", error);
    return c.json({ error: "Could not fetch available donors from messaging service" }, 503);
  }
});

export default bloodApi;
