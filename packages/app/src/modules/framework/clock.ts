import assert from "node:assert";

import { Injectable, Module } from "@nestjs/common";

@Injectable()
export class Clock {
  constructor() {
    this.assertsUtcTimezone();
  }

  now(): Date {
    return new Date();
  }

  private assertsUtcTimezone(): asserts this {
    const now = this.now();
    assert.ok(now.getTimezoneOffset() === 0, `the configured Timezone is not UTC`);
  }
}

@Module({
  providers: [Clock],
  exports: [Clock],
})
export class ClockModule {}
