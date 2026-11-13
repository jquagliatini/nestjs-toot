import { I18nContext, I18nService } from "@nestjs/i18n";
import { aroundEach } from "vitest";

aroundEach((x) => {
  const i18n = {
    matchLocale: () => "en",
    t: (key: string) => key,
    translate: (key: string) => key,
  } as unknown as I18nService;
  return new I18nContext(i18n).run("en", x);
});
