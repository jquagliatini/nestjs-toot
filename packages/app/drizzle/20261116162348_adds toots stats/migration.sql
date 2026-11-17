CREATE TABLE "toot_stats" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "toot_stats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"count" bigint DEFAULT 0 NOT NULL
);

insert into "toot_stats" ("count")
select count("id") as "count"
from "articles";
