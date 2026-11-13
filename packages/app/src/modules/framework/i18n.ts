import * as path from "node:path";

import { Module } from "@nestjs/common";
import * as i18n from "@nestjs/i18n";

@Module({
  exports: [i18n.I18nModule],
  imports: [
    i18n.I18nModule.forRoot({
      defaultLocale: "en",
      supportedLocales: ["en"],
      resolvers: [new i18n.CookieLocaleResolver(), new i18n.QueryLocaleResolver()],
      loader: new i18n.JsonI18nLoader({
        path: path.join(import.meta.dirname, "../../../i18n"),
      }),
    }),
  ],
})
export class I18nModule {}
