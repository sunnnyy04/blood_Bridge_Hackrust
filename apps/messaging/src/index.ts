import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import {
  db,
  mockDonors,
  bloodRequests,
  bloodRequestResponses,
} from "./db/schema.js";
import { eq, sql, and, or, isNull, lt } from "drizzle-orm";
import Twilio from "twilio";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type"],
    allowMethods: ["POST", "GET", "OPTIONS"],
  }),
);

app.onError((err, c) => {
  console.error("Messaging Service Error:", err);
  return c.json(
    {
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
    500,
  );
});

const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

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

function isWithinRadius(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radiusKm: number,
): boolean {
  return haversineDistance(lat1, lon1, lat2, lon2) <= radiusKm;
}

app.post("/send-alert", async (c) => {
  const body = await c.req.json();
  const { bloodType, hospitalName, hospitalPhone, latitude, longitude, radiusKm = 5, requestType = "blood" } = body;

  if (
    !bloodType ||
    !hospitalName ||
    !hospitalPhone ||
    !latitude ||
    !longitude
  ) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const hospitalLat = parseFloat(latitude);
  const hospitalLon = parseFloat(longitude);

  const compatibleTypes = bloodCompatibility[bloodType] || [bloodType];

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const allDonors = await db
    .select()
    .from(mockDonors)
    .where(and(
      eq(mockDonors.isAvailable, true),
      sql`${mockDonors.bloodType} IN ${compatibleTypes}`,
      requestType === "plasma" ? eq(mockDonors.canDonatePlasma, true) : eq(mockDonors.canDonateBlood, true),
      or(
        isNull(mockDonors.lastDonatedAt),
        lt(mockDonors.lastDonatedAt, threeMonthsAgo)
      )
    ));

  const nearbyDonors = allDonors.filter((donor) => {
    const donorLat = parseFloat(donor.latitude);
    const donorLon = parseFloat(donor.longitude);
    return isWithinRadius(hospitalLat, hospitalLon, donorLat, donorLon, radiusKm);
  });

  let suggestions = null;
  if (nearbyDonors.length === 0) {
    suggestions = {
      "10": allDonors.filter(d => isWithinRadius(hospitalLat, hospitalLon, parseFloat(d.latitude), parseFloat(d.longitude), 10)).length,
      "20": allDonors.filter(d => isWithinRadius(hospitalLat, hospitalLon, parseFloat(d.latitude), parseFloat(d.longitude), 20)).length,
      "50": allDonors.filter(d => isWithinRadius(hospitalLat, hospitalLon, parseFloat(d.latitude), parseFloat(d.longitude), 50)).length,
    };
  }

  const requestId = crypto.randomUUID();
  await db.insert(bloodRequests).values({
    id: requestId,
    bloodType,
    requestType: requestType as any,
    hospitalName,
    hospitalPhone,
    latitude,
    longitude,
    recipientsNotified: 0,
  });

  let sentCount = 0;

  for (const donor of nearbyDonors) {
    const toNumber = donor.phone.startsWith("whatsapp:")
      ? donor.phone
      : `whatsapp:${donor.phone}`;

    const typeLabel = requestType.toUpperCase();
    const bodyText = `🩸 Urgent ${typeLabel} Request\n\nHospital: ${hospitalName}\nType Needed: ${bloodType} ${typeLabel}\n\nIf you are able to donate, please contact:\n📞 ${hospitalPhone}\n\nReply YES to confirm or NO to decline.\n\nRequest ID: ${requestId}`;

    if (twilioClient && fromNumber) {
      try {
        const formattedFrom = fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`;
        await twilioClient.messages.create({
          body: bodyText,
          from: formattedFrom,
          to: toNumber,
        });
        sentCount++;
      } catch (error) {
        console.error("Failed to send to", donor.phone, error);
      }
    } else {
      sentCount++;
    }
  }

  await db
    .update(bloodRequests)
    .set({ recipientsNotified: sentCount })
    .where(eq(bloodRequests.id, requestId));

  return c.json({
    success: true,
    recipientsNotified: sentCount,
    requestId,
    suggestions,
    searchRadius: radiusKm,
    nearbyDonors: nearbyDonors.map(d => ({
      id: d.id,
      name: d.name,
      bloodType: d.bloodType,
      phone: d.phone,
      latitude: d.latitude,
      longitude: d.longitude
    }))
  });
});

app.post("/webhook/whatsapp", async (c) => {
  const body = await c.req.formData();
  const messageBody = body.get("Body")?.toString().toLowerCase().trim();
  const from = body.get("From")?.toString().replace("whatsapp:", "");
  const requestIdMatch = messageBody?.match(/([a-f0-9-]{36})/i);

  console.log("Incoming WhatsApp:", { messageBody, from, requestIdMatch });

  if (!from) {
    return c.text("");
  }

  const response = messageBody === "yes" ? "yes" : "no";

  let requestId = requestIdMatch ? requestIdMatch[1] : null;

  if (!requestId) {
    const latestRequest = await db
      .select()
      .from(bloodRequests)
      .orderBy(sql`${bloodRequests.createdAt} desc`)
      .limit(1)
      .then((rows) => rows[0]);

    if (latestRequest) {
      requestId = latestRequest.id;
    }
  }

  const donor = await db
    .select()
    .from(mockDonors)
    .where(eq(mockDonors.phone, from))
    .then((rows) => rows[0]);

  const donorName = donor?.name || from;

  if (requestId) {
    await db.insert(bloodRequestResponses).values({
      id: crypto.randomUUID(),
      bloodRequestId: requestId,
      donorPhone: from,
      donorName,
      response,
    });

    if (response === "yes") {
      const requestDetails = await db
        .select()
        .from(bloodRequests)
        .where(eq(bloodRequests.id, requestId))
        .then((rows) => rows[0]);

      if (requestDetails && requestDetails.status === "pending") {
        await db
          .update(bloodRequests)
          .set({
            status: "assigned",
            assignedDonorId: donor?.id,
            assignedDonorPhone: from,
            assignedDonorName: donorName,
            assignedAt: new Date(),
          })
          .where(eq(bloodRequests.id, requestId));

        if (twilioClient && fromNumber) {
          try {
            const formattedFrom = fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`;
            await twilioClient.messages.create({
              body: `Donor Assigned!\n\nDonor: ${donorName}\nPhone: ${from}\nBlood Type: ${donor?.bloodType || "Unknown"}\n\nThis donor has been assigned to your request. Please coordinate with them directly.`,
              from: formattedFrom,
              to: requestDetails.hospitalPhone.startsWith("whatsapp:")
                ? requestDetails.hospitalPhone
                : `whatsapp:${requestDetails.hospitalPhone}`,
            });
          } catch (err) {
            console.error("Failed to notify hospital:", err);
          }
        }
      }
    }
  }

  if (response === "yes") {
    await db
      .update(mockDonors)
      .set({ isAvailable: true })
      .where(eq(mockDonors.phone, from));

    const replyMessage =
      "Thank you for confirming! The hospital will contact you shortly. 🩸";

    if (twilioClient && fromNumber) {
      try {
        const formattedFrom = fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`;
        await twilioClient.messages.create({
          body: replyMessage,
          from: formattedFrom,
          to: `whatsapp:${from}`,
        });
      } catch (error) {
        console.error("Failed to send reply to", from, error);
      }
    }
  } else {
    await db
      .update(mockDonors)
      .set({ isAvailable: false })
      .where(eq(mockDonors.phone, from));
  }

  return c.text("");
});

app.get("/requests", async (c) => {
  const requests = await db
    .select()
    .from(bloodRequests)
    .orderBy(sql`${bloodRequests.createdAt} desc`)
    .limit(50);

  return c.json({ requests });
});

app.get("/requests/:id/responses", async (c) => {
  const requestId = c.req.param("id");

  const responses = await db
    .select()
    .from(bloodRequestResponses)
    .where(eq(bloodRequestResponses.bloodRequestId, requestId));

  const availableDonors = responses.filter((r) => r.response === "yes");

  return c.json({ responses, availableDonors });
});

app.get("/donors/available", async (c) => {
  const donors = await db
    .select()
    .from(mockDonors)
    .where(eq(mockDonors.isAvailable, true));

  return c.json({ donors });
});

app.post("/requests/:id/complete", async (c) => {
  const id = c.req.param("id");

  const reqDetails = await db.select().from(bloodRequests).where(eq(bloodRequests.id, id)).then(r => r[0]);

  await db
    .update(bloodRequests)
    .set({ status: "completed", completedAt: new Date() })
    .where(eq(bloodRequests.id, id));

  if (reqDetails?.assignedDonorId) {
    await db.update(mockDonors)
      .set({ lastDonatedAt: new Date() })
      .where(eq(mockDonors.id, reqDetails.assignedDonorId));
  }

  return c.json({ success: true });
});

app.post("/requests/:id/cancel", async (c) => {
  const id = c.req.param("id");
  await db
    .update(bloodRequests)
    .set({ status: "cancelled" })
    .where(eq(bloodRequests.id, id));
  return c.json({ success: true });
});

app.get("/health", (c) => c.json({ status: "ok" }));

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    console.log(`Messaging service running on http://localhost:${info.port}`);
  },
);
