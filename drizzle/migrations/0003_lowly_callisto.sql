CREATE TABLE "story_reviews" (
	"id" uuid PRIMARY KEY NOT NULL,
	"adventure_id" uuid NOT NULL,
	"reviewer_email" text NOT NULL,
	"rating" integer NOT NULL,
	"review_text" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "story_reviews" ADD CONSTRAINT "story_reviews_adventure_id_adventures_id_fk" FOREIGN KEY ("adventure_id") REFERENCES "public"."adventures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "story_reviews_unique_reviewer_idx" ON "story_reviews" USING btree ("adventure_id","reviewer_email");--> statement-breakpoint
CREATE INDEX "story_reviews_adventure_id_idx" ON "story_reviews" USING btree ("adventure_id");