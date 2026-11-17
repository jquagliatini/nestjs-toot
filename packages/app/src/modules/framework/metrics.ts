import type { ServerResponse } from "node:http";

import { serializeMetrics } from "@jqgl.cc/otel";
import { Controller, Get, Module, Res } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";

@Controller("/metrics")
@ApiExcludeController()
class MetricsController {
  @Get()
  async listMetrics(@Res({ passthrough: true }) res: ServerResponse): Promise<string> {
    const { content, contentType } = await serializeMetrics();
    res.setHeader("content-type", contentType);
    return content;
  }
}

@Module({ controllers: [MetricsController] })
export class MetricsModule {}
