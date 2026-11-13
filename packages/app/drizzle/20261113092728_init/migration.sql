CREATE TABLE "article_comments" (
	"created_at" timestamp DEFAULT now(),
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "article_comments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1000 CACHE 1),
	"content" text NOT NULL,
	"author_id" uuid
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"created_at" timestamp DEFAULT now(),
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "articles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 10000 CACHE 1),
	"content" text NOT NULL,
	"author_id" uuid NOT NULL,
	"likes_count" bigint DEFAULT 0 NOT NULL,
	"comments_count" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "articles__likes_count_positive__ck" CHECK ("likes_count" >= 0),
	CONSTRAINT "articles__comments_count_positive__ck" CHECK ("comments_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"created_at" timestamp DEFAULT now(),
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"created_at" timestamp DEFAULT now(),
	"id" uuid PRIMARY KEY,
	"username" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"password" text NOT NULL,
	CONSTRAINT "users__username_not_empty__ck" CHECK (length(trim("username")) > 0)
);
--> statement-breakpoint
CREATE INDEX "article_comments__author_id__idx" ON "article_comments" ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users__email__uidx" ON "users" ("email");--> statement-breakpoint
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_author_id_users_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;