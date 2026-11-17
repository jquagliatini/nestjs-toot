import { TransactionHost } from "@nestjs-cls/transactional";
import type { TransactionalAdapterDrizzleOrm } from "@nestjs-cls/transactional-adapter-drizzle-orm";
import { sql, defineRelations } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { index, timestamp, check, snakeCase, uniqueIndex, primaryKey } from "drizzle-orm/pg-core";

const mixins = {
  createdAt: {
    createdAt: timestamp().notNull().defaultNow(),
  },
};

export const users = snakeCase.table(
  "users",
  (t) => ({
    ...mixins.createdAt,

    id: t.uuid().notNull().primaryKey(),
    username: t.text().notNull(),
    email: t.text().notNull().unique(),
    password: t.text().notNull(),
  }),

  (t) => [
    uniqueIndex(`users__email__uidx`).on(t.email),
    check(`users__username_not_empty__ck`, sql`length(trim(${t.username})) > 0`),
  ],
);

export const authSessions = snakeCase.table(`auth_sessions`, (t) => ({
  ...mixins.createdAt,

  id: t.uuid().notNull().primaryKey(),
  userId: t
    .uuid()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: t.timestamp().notNull(),
}));

export const articles = snakeCase.table(
  `articles`,
  (t) => ({
    ...mixins.createdAt,

    id: t.uuid().notNull().primaryKey(),
    content: t.text().notNull(),
    authorId: t
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    likesCount: t.bigint({ mode: "number" }).notNull().default(0),
    commentsCount: t.bigint({ mode: "number" }).notNull().default(0),
  }),
  (t) => [
    check(`articles__likes_count_positive__ck`, sql`${t.likesCount} >= 0`),
    check(`articles__comments_count_positive__ck`, sql`${t.commentsCount} >= 0`),
  ],
);

export const articleLikes = snakeCase.table(
  "article_likes",
  (t) => ({
    ...mixins.createdAt,
    articleId: t.uuid().references(() => articles.id, { onDelete: "cascade" }),
    authorId: t.uuid().references(() => users.id, { onDelete: "cascade" }),
  }),
  (t) => [primaryKey(t.articleId, t.authorId)],
);

export const articleComments = snakeCase.table(
  "article_comments",
  (t) => ({
    ...mixins.createdAt,

    id: t.uuid().notNull().primaryKey(),
    content: t.text().notNull(),
    authorId: t.uuid().references(() => users.id, { onDelete: `set null` }),
    articleId: t.uuid().references(() => articles.id, { onDelete: "cascade" }),
  }),
  (t) => [
    index(`article_comments__author_id__idx`).on(t.authorId),
    index(`article_comments__article_id__idx`).on(t.articleId),
  ],
);

export const tootStats = snakeCase.table("toot_stats", (t) => ({
  id: t.bigint({ mode: "string" }).notNull().generatedAlwaysAsIdentity().primaryKey(),
  count: t.bigint({ mode: "number" }).notNull().default(0),
}));

export const schema = { users, articles, articleComments, articleLikes, authSessions, tootStats };
export const relations = defineRelations(schema, (r) => ({
  users: {
    articles: r.many.articles(),
    comments: r.many.articleComments(),
    authSessions: r.many.authSessions(),
    articleLikes: r.many.articleLikes(),
  },
  articles: {
    author: r.one.users({ from: r.articles.authorId, to: r.users.id, optional: false }),
    comments: r.many.articleComments(),
    likes: r.many.articleLikes(),
  },
  articleComments: {
    author: r.one.users({ from: r.articleComments.authorId, to: r.users.id, optional: true }),
    article: r.one.articles({
      from: r.articleComments.articleId,
      to: r.articles.id,
      optional: false,
    }),
  },
  articleLikes: {
    article: r.one.articles({
      from: r.articleLikes.articleId,
      to: r.articles.id,
      optional: false,
    }),
    author: r.one.users({
      from: r.articleLikes.authorId,
      to: r.users.id,
      optional: false,
    }),
  },
  authSessions: {
    user: r.one.users({ from: r.authSessions.userId, to: r.users.id, optional: false }),
  },
}));

// oxlint-disable typescript/no-unsafe-declaration-merging
type InternalDatabaseType = NodePgDatabase<typeof relations>;
type InternalTransactionalAdapter = TransactionalAdapterDrizzleOrm<InternalDatabaseType>;

export class Db extends TransactionHost<InternalTransactionalAdapter> {}
