import { pgTable, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";
export const requestStatusEnum = pgEnum("request_status", [
    "pending",
    "assigned",
    "completed",
    "cancelled",
]);
export const requestTypeEnum = pgEnum("request_type", [
    "blood",
    "plasma",
]);
export const bloodRequests = pgTable("blood_requests", {
    id: text("id").primaryKey(),
    hospitalId: text("hospital_id").notNull(),
    bloodType: text("blood_type").notNull(),
    requestType: requestTypeEnum("request_type").default("blood").notNull(),
    recipientsNotified: integer("recipients_notified").default(0),
    status: requestStatusEnum("status").default("pending").notNull(),
    assignedDonorId: text("assigned_donor_id"), // ID of the donor from 'user' table
    assignedAt: timestamp("assigned_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
