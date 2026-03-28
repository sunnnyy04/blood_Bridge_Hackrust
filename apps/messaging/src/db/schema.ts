import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/neon-http";

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

export const mockDonors = pgTable("mock_donors", {
  id: text("id").primaryKey(),
  name: text("name"),
  phone: text("phone").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  bloodType: text("blood_type").notNull(),
  isAvailable: boolean("is_available").default(false).notNull(),
  canDonateBlood: boolean("can_donate_blood").default(true).notNull(),
  canDonatePlasma: boolean("can_donate_plasma").default(false).notNull(),
  lastDonatedAt: timestamp("last_donated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bloodRequests = pgTable("blood_requests", {
  id: text("id").primaryKey(),
  bloodType: text("blood_type").notNull(),
  requestType: requestTypeEnum("request_type").default("blood").notNull(),
  hospitalName: text("hospital_name").notNull(),
  hospitalPhone: text("hospital_phone").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  recipientsNotified: integer("recipients_notified").default(0),
  status: requestStatusEnum("status").default("pending").notNull(),
  assignedDonorId: text("assigned_donor_id"),
  assignedDonorPhone: text("assigned_donor_phone"),
  assignedDonorName: text("assigned_donor_name"),
  assignedAt: timestamp("assigned_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bloodRequestResponses = pgTable("blood_request_responses", {
  id: text("id").primaryKey(),
  bloodRequestId: text("blood_request_id")
    .notNull()
    .references(() => bloodRequests.id, { onDelete: "cascade" }),
  donorPhone: text("donor_phone").notNull(),
  donorName: text("donor_name"),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const db = drizzle(process.env.DATABASE_URL as string, {
  schema: { mockDonors, bloodRequests, bloodRequestResponses, requestStatusEnum, requestTypeEnum },
});

export type MockDonor = typeof mockDonors.$inferSelect;
export type BloodRequest = typeof bloodRequests.$inferSelect;
export type BloodRequestResponse = typeof bloodRequestResponses.$inferSelect;
