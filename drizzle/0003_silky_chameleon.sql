CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" text NOT NULL,
	"course_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"gateway_status" text,
	"gateway_status_description" text,
	"reference_number" text,
	"poll_url" text,
	"redirect_url" text,
	"method_code" text NOT NULL,
	"method_name" text NOT NULL,
	"flow" text NOT NULL,
	"payer_phone" text,
	"instructions" text,
	"paid_at" timestamp with time zone,
	"fulfilled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_reference_number_unique" UNIQUE("reference_number")
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payments_profile_idx" ON "payments" USING btree ("profile_id","created_at");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");