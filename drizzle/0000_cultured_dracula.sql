CREATE TYPE "public"."funding_type" AS ENUM('full', 'partial', 'tuition', 'stipend');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('student', 'instructor', 'admin');--> statement-breakpoint
CREATE TYPE "public"."scholarship_level" AS ENUM('language', 'undergraduate', 'masters', 'phd', 'research');--> statement-breakpoint
CREATE TYPE "public"."scholarship_status" AS ENUM('draft', 'published', 'closed');--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"image_url" text,
	"role" "role" DEFAULT 'student' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_scholarships" (
	"profile_id" text NOT NULL,
	"scholarship_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_scholarships_profile_id_scholarship_id_pk" PRIMARY KEY("profile_id","scholarship_id")
);
--> statement-breakpoint
CREATE TABLE "scholarships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"provider" text NOT NULL,
	"university" text,
	"country" text DEFAULT 'South Korea' NOT NULL,
	"level" "scholarship_level" NOT NULL,
	"funding_type" "funding_type" NOT NULL,
	"amount" text,
	"summary" text NOT NULL,
	"description" text,
	"eligibility" text[] DEFAULT '{}' NOT NULL,
	"benefits" text[] DEFAULT '{}' NOT NULL,
	"required_documents" text[] DEFAULT '{}' NOT NULL,
	"required_certificates" text[] DEFAULT '{}' NOT NULL,
	"intake" text,
	"opens_at" date,
	"deadline" date,
	"apply_url" text,
	"status" "scholarship_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "scholarships_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "saved_scholarships" ADD CONSTRAINT "saved_scholarships_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_scholarships" ADD CONSTRAINT "saved_scholarships_scholarship_id_scholarships_id_fk" FOREIGN KEY ("scholarship_id") REFERENCES "public"."scholarships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scholarships" ADD CONSTRAINT "scholarships_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "scholarships_status_deadline_idx" ON "scholarships" USING btree ("status","deadline");