import type auth from "../../i18n/en/auth.json";

export type Translations = {
  auth: typeof auth;
};

declare module "@nestjs/i18n" {
  interface I18nTypes {
    translations: Translations;
  }
}
