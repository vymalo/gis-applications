CREATE TYPE "public"."ApplicationDocumentKind" AS ENUM('ID', 'GCE_OL_CERT', 'PROBATOIRE_CERT', 'GCE_AL_CERT', 'BAC_CERT', 'UNIVERSITY_CERT', 'RECOMMENDATION', 'MOTIVATION', 'CV', 'TRANSCRIPT', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."ApplicationDocumentStatus" AS ENUM('approved', 'rejected', 'pending');--> statement-breakpoint
CREATE TYPE "public"."ApplicationEducationStatus" AS ENUM('IN_PROGRESS', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."ApplicationEducationType" AS ENUM('GCE_OL', 'GCE_AL', 'BAC', 'PROBATOIRE', 'BTS', 'BACHELOR', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."ApplicationPhoneKind" AS ENUM('PRIMARY', 'SECONDARY', 'GUARDIAN', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."ApplicationStatus" AS ENUM('DRAFT', 'INIT', 'PHONE_INTERVIEW_PHASE', 'ONSITE_INTERVIEW_PHASE', 'ACCEPTED', 'REJECTED', 'NEED_APPLICANT_INTERVENTION');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_consent" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"consent_type" text NOT NULL,
	"value" boolean NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"version" text
);
--> statement-breakpoint
CREATE TABLE "application_document" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"education_id" text,
	"kind" "ApplicationDocumentKind" NOT NULL,
	"name" text NOT NULL,
	"public_url" text NOT NULL,
	"status" "ApplicationDocumentStatus" DEFAULT 'pending' NOT NULL,
	"reviewer_comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_education" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"type" "ApplicationEducationType" NOT NULL,
	"school_name" text NOT NULL,
	"city" text,
	"country" text,
	"field_of_study" text,
	"start_date" date,
	"end_date" date,
	"completion_date" date,
	"status" "ApplicationEducationStatus" DEFAULT 'IN_PROGRESS',
	"gpa" text,
	"candidate_number" text,
	"session_year" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_phone" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"phone_number" text NOT NULL,
	"whatsapp_call" boolean DEFAULT false NOT NULL,
	"normal_call" boolean DEFAULT false NOT NULL,
	"kind" "ApplicationPhoneKind" DEFAULT 'PRIMARY' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_program_choice" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"rank" integer DEFAULT 1 NOT NULL,
	"program_code" text NOT NULL,
	"campus" text,
	"start_term" text,
	"study_mode" text,
	"funding_type" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_status_history" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"status" "ApplicationStatus" NOT NULL,
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"changed_by_id" text,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "application" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"createdById" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"birth_date" date NOT NULL,
	"who_are_you" text,
	"phone_numbers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"country" text NOT NULL,
	"city" text NOT NULL,
	"where_are_you" text,
	"has_id_cart_or_passport" boolean DEFAULT false NOT NULL,
	"id_cart_or_passport_or_receipt" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"high_school_over" boolean DEFAULT false NOT NULL,
	"high_school_gce_ol_probatoir_date" date,
	"high_school_gce_ol_probatoire_certificates" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"high_school_gce_al_bac_date" date,
	"high_school_gce_al_bac_certificates" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"university_student" boolean DEFAULT false NOT NULL,
	"university_start_date" date,
	"university_end_date" date,
	"university_certificates" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"meta_invited_statuses" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"meta_document_statuses" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"meta_document_comments" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "ApplicationStatus" DEFAULT 'INIT' NOT NULL,
	"email" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"birth_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"role" text DEFAULT 'user' NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_consent" ADD CONSTRAINT "application_consent_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_document" ADD CONSTRAINT "application_document_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_document" ADD CONSTRAINT "application_document_education_id_application_education_id_fk" FOREIGN KEY ("education_id") REFERENCES "public"."application_education"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_education" ADD CONSTRAINT "application_education_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_phone" ADD CONSTRAINT "application_phone_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_program_choice" ADD CONSTRAINT "application_program_choice_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_status_history" ADD CONSTRAINT "application_status_history_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_status_history" ADD CONSTRAINT "application_status_history_changed_by_id_user_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_createdById_user_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "application_consent_application_idx" ON "application_consent" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "application_document_application_idx" ON "application_document" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "application_document_education_idx" ON "application_document" USING btree ("education_id");--> statement-breakpoint
CREATE INDEX "application_document_status_idx" ON "application_document" USING btree ("status");--> statement-breakpoint
CREATE INDEX "application_document_kind_idx" ON "application_document" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "application_education_application_idx" ON "application_education" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "application_education_type_idx" ON "application_education" USING btree ("type");--> statement-breakpoint
CREATE INDEX "application_phone_application_idx" ON "application_phone" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "application_program_choice_application_idx" ON "application_program_choice" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "application_status_history_application_idx" ON "application_status_history" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "application_created_by_id_idx" ON "application" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");