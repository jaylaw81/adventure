CREATE TABLE "story_reports" (
	"id" uuid PRIMARY KEY NOT NULL,
	"adventure_id" uuid NOT NULL,
	"reporter_email" text,
	"reason" text NOT NULL,
	"details" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"review_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "story_reports" ADD CONSTRAINT "story_reports_adventure_id_adventures_id_fk" FOREIGN KEY ("adventure_id") REFERENCES "public"."adventures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "story_reports_adventure_id_idx" ON "story_reports" USING btree ("adventure_id");--> statement-breakpoint
CREATE INDEX "story_reports_status_idx" ON "story_reports" USING btree ("status");