CREATE TYPE "public"."subscription_mode" AS ENUM('open', 'approval', 'closed');--> statement-breakpoint
CREATE TABLE "subscription_request" (
	"id" text PRIMARY KEY NOT NULL,
	"organisation_id" text NOT NULL,
	"user_id" text NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organisation" ADD COLUMN "subscription_mode" "subscription_mode" DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_request" ADD CONSTRAINT "subscription_request_organisation_id_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_request" ADD CONSTRAINT "subscription_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_request_org_user_idx" ON "subscription_request" USING btree ("organisation_id","user_id");