CREATE TABLE "password_reset_tokens" (
	"token" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
