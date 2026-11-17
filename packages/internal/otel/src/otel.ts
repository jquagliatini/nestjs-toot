import * as assert from "node:assert/strict";
import type { IncomingMessage } from "node:http";

import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import { W3CBaggagePropagator } from "@opentelemetry/core";
import { PrometheusExporter, PrometheusSerializer } from "@opentelemetry/exporter-prometheus";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";

const prometheusExporter = new PrometheusExporter({
  preventServerStart: true,
});
export function otel(options: { name: string; version: string }): NodeSDK {
  return new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: options.name,
      [ATTR_SERVICE_VERSION]: options.version,
    }),

    spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
    metricReaders: [
      prometheusExporter,
      // new PeriodicExportingMetricReader({ exporter: new OTLPMetricExporter() }),
    ],
    instrumentations: [
      new UndiciInstrumentation(),
      new HttpInstrumentation({
        disableOutgoingRequestInstrumentation: true,
        ignoreIncomingRequestHook: (req: IncomingMessage) =>
          req.url === "/_health" || req.url === "/metrics",
        headersToSpanAttributes: {
          server: { requestHeaders: ["user-agent", "referer", "accept-language"] },
        },
      }),
    ],
    contextManager: new AsyncLocalStorageContextManager(),
    textMapPropagator: new W3CBaggagePropagator(),
  });
}

export async function observe(options: {
  name: string;
  version: string;
  app: () => Promise<void>;
}): Promise<void> {
  const { app, ...otelOptions } = options;
  const sdk = otel(otelOptions);
  sdk.start();

  return app();
}

export async function serializeMetrics(format: "prometheus" = "prometheus"): Promise<{
  content: string;
  contentType: string;
}> {
  assert.ok(format === "prometheus", `no other format than "prometheus" is currently supported`);

  const { resourceMetrics: metrics } = await prometheusExporter.collect();
  const serializer = new PrometheusSerializer();
  const content = serializer.serialize(metrics);

  /** @see https://prometheus.io/docs/instrumenting/content_negotiation/#protocol-headers */
  return { content, contentType: `text/plain; charset=utf-8; version=0.0.4` };
}
