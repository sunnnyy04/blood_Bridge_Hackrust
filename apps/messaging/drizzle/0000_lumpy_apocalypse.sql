CREATE TABLE "blood_request_responses" (
	"id" text PRIMARY KEY NOT NULL,
	"blood_request_id" text NOT NULL,
	"donor_phone" text NOT NULL,
	"donor_name" text,
	"response" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blood_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"blood_type" text NOT NULL,
	"hospital_name" text NOT NULL,
	"hospital_phone" text NOT NULL,
	"latitude" text NOT NULL,
	"longitude" text NOT NULL,
	"recipients_notified" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mock_donors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"phone" text NOT NULL,
	"latitude" text NOT NULL,
	"longitude" text NOT NULL,
	"blood_type" text NOT NULL,
	"is_available" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blood_request_responses" ADD CONSTRAINT "blood_request_responses_blood_request_id_blood_requests_id_fk" FOREIGN KEY ("blood_request_id") REFERENCES "public"."blood_requests"("id") ON DELETE cascade ON UPDATE no action;