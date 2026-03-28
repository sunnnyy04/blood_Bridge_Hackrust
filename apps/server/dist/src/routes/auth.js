import { auth } from "@/lib/auth.js";
import { Hono } from "hono";
import { db } from "@/db/index.js";
import { user, bloodRequests } from "@/db/schema/index.js";
import { eq, and } from "drizzle-orm";
const authApi = new Hono();
authApi.get("/donor/stats", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session || session.user.role !== "donor") {
        return c.json({ error: "Unauthorized" }, 401);
    }
    const userId = session.user.id;
    const userPhone = session.user.phone;
    const fulfilledRequests = await db
        .select()
        .from(bloodRequests)
        .where(and(eq(bloodRequests.assignedDonorId, userId), eq(bloodRequests.status, "completed")));
    return c.json({
        fulfilledCount: fulfilledRequests.length,
        isAvailable: session.user.isAvailable,
    });
});
authApi.patch("/donor/availability", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session || session.user.role !== "donor") {
        return c.json({ error: "Unauthorized" }, 401);
    }
    const { isAvailable } = await c.req.json();
    await db.update(user)
        .set({ isAvailable })
        .where(eq(user.id, session.user.id));
    return c.json({ success: true, isAvailable });
});
authApi.on(["POST", "GET"], "*", (c) => {
    return auth.handler(c.req.raw);
});
export default authApi;
