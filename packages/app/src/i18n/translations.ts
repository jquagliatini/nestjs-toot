import type auth from "../../i18n/en/auth.json";
import type toots from "../../i18n/en/toots.json";

export type Translations = {
  auth: typeof auth;
  toots: typeof toots;
};

declare module "@nestjs/i18n" {
  interface I18nTypes {
    translations: Translations;
  }
}
