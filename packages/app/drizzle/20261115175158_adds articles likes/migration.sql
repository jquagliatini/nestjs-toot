CREATE TABLE "article_likes" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"article_id" uuid,
	"author_id" uuid,
	CONSTRAINT "article_likes_pkey" PRIMARY KEY("article_id","author_id")
);
--> statement-breakpoint
ALTER TABLE "article_likes" ADD CONSTRAINT "article_likes_article_id_articles_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "article_likes" ADD CONSTRAINT "article_likes_author_id_users_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE;