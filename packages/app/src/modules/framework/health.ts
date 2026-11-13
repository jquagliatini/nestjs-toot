import { Controller, Get, Module } from "@nestjs/common";
import { Timeout, type Duration } from "@nestjs/resilience";
import { ApiOkResponse } from "@nestjs/swagger";
import { sql } from "drizzle-orm";
import { z } from "zod";

import { Db } from "./database/schema.js";

const HealthDtoSchema = z.object({ up: z.boolean(), db: z.boolean() }).meta({ name: "HealthDto" });

@Controller("/_health")
class HealthController {
  constructor(private readonly db: Db) {}

  @Get()
  @Timeout("1s" satisfies Duration)
  @ApiOkResponse({ standardSchema: HealthDtoSchema })
  async getHealth(): Promise<{ up: boolean; db: boolean }> {
    const dbIsUp = Boolean(await this.db.tx.execute(sql<1>`select 1`).catch(() => 0));
    return { up: true, db: dbIsUp };
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}
