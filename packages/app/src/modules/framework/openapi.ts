import { Config } from "@jqgl.cc/config";
import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import pkg from "../../../package.json" with { type: "json" };

export function withOpenApi<App extends INestApplication>(app: App): App {
  const config = app.get(Config);
  const docConfig = new DocumentBuilder()
    .setTitle(config.app.name)
    .setDescription(`[raw json](/openapi.json)`)
    .setVersion(pkg.version)
    .addServer(config.app.baseUrl)
    .addBearerAuth({ name: "bearer", type: "http", bearerFormat: undefined })
    .addBasicAuth({ name: "basic", type: "http" })
    .build();

  SwaggerModule.setup(
    `/openapi`,
    app,
    () =>
      SwaggerModule.createDocument(app, docConfig, { operationIdFactory: (_, method) => method }),
    {
      jsonDocumentUrl: `/openapi.json`,
      swaggerOptions: {
        defaultModelsExpandDepth: -1,
        displayOperationId: true,
        // docExpansion: "none",
      },
    },
  );

  return app;
}
