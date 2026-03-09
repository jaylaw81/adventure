CREATE TABLE "adventures" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"user_email" text,
	"audience" text DEFAULT 'all' NOT NULL,
	"tags" text DEFAULT '[]' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"share_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "adventures_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "choices" (
	"id" uuid PRIMARY KEY NOT NULL,
	"adventure_id" uuid NOT NULL,
	"source_node_id" uuid NOT NULL,
	"target_node_id" uuid NOT NULL,
	"label" text DEFAULT 'Continue' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nodes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"adventure_id" uuid NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"node_type" text DEFAULT 'scene' NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"image_url" text,
	"position_x" double precision DEFAULT 0 NOT NULL,
	"position_y" double precision DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"email" text PRIMARY KEY NOT NULL,
	"display_name" text DEFAULT '' NOT NULL,
	"birth_date" text,
	"password_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "choices" ADD CONSTRAINT "choices_adventure_id_adventures_id_fk" FOREIGN KEY ("adventure_id") REFERENCES "public"."adventures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "choices" ADD CONSTRAINT "choices_source_node_id_nodes_id_fk" FOREIGN KEY ("source_node_id") REFERENCES "public"."nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "choices" ADD CONSTRAINT "choices_target_node_id_nodes_id_fk" FOREIGN KEY ("target_node_id") REFERENCES "public"."nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_adventure_id_adventures_id_fk" FOREIGN KEY ("adventure_id") REFERENCES "public"."adventures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "adventures_user_email_idx" ON "adventures" USING btree ("user_email");--> statement-breakpoint
CREATE INDEX "adventures_is_public_idx" ON "adventures" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "choices_adventure_id_idx" ON "choices" USING btree ("adventure_id");--> statement-breakpoint
CREATE INDEX "choices_source_node_id_idx" ON "choices" USING btree ("source_node_id");--> statement-breakpoint
CREATE INDEX "nodes_adventure_id_idx" ON "nodes" USING btree ("adventure_id");