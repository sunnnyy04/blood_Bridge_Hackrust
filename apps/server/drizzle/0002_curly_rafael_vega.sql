CREATE TABLE "blood_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"hospital_id" text NOT NULL,
	"blood_type" text NOT NULL,
	"recipients_notified" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'donor';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "blood_type" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "latitude" integer;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "longitude" integer;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "hospital_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "contact_name" text;--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "impersonated_by";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "banned";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "ban_reason";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "ban_expires";