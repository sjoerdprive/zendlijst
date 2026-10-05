CREATE TYPE "public"."newsletter_source" AS ENUM('editor', 'upload');--> statement-breakpoint
ALTER TABLE "newsletter" ALTER COLUMN "title" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "newsletter" ALTER COLUMN "file_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "newsletter" ALTER COLUMN "content_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "newsletter" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "newsletter" ADD COLUMN "source" "newsletter_source";--> statement-breakpoint
ALTER TABLE "newsletter" ADD COLUMN "body" jsonb;--> statement-breakpoint
ALTER TABLE "newsletter" ADD COLUMN "version" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "note" ADD COLUMN "for_next_draft" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "note" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "note_newsletter_idx" ON "note" USING btree ("newsletter_id");--> statement-breakpoint
UPDATE "newsletter" SET "source" = 'upload' WHERE "content" IS NOT NULL;--> statement-breakpoint
UPDATE "note" SET "archived_at" = now() WHERE "done" = true AND "newsletter_id" IN (SELECT "id" FROM "newsletter" WHERE "status" = 'sent');
