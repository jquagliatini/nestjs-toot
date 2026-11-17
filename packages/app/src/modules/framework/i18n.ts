import * as path from "node:path";

import { Module } from "@nestjs/common";
import * as i18n from "@nestjs/i18n";
import { IntlMessageFormat } from "intl-messageformat";

class IcuMessageFormatter implements i18n.I18nMessageFormatter {
  format(message: string, args: Record<string, unknown>, locale: string): string {
    return String(
      new IntlMessageFormat(message, locale, undefined, { ignoreTag: true }).format(args),
    );
  }
}

@Module({
  exports: [i18n.I18nModule],
  imports: [
    i18n.I18nModule.forRoot({
      defaultLocale: "en",
      supportedLocales: ["en"],
      formatter: new IcuMessageFormatter(),
      resolvers: [new i18n.CookieLocaleResolver(), new i18n.QueryLocaleResolver()],
      loader: new i18n.JsonI18nLoader({
        path: path.join(import.meta.dirname, "../../../i18n"),
      }),
    }),
  ],
})
export class I18nModule {}
