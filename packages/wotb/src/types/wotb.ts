import { WOTBLanguage, WOTBRealm } from '../enums';

export interface WOTBAPIWithLanguage {
  /**
   * Localization language.
   *
   * @default WOTBLanguage.English
   */
  language?: WOTBLanguage;
}
export interface WOTBAPIConstructorOptions {
  /**
   * Specifies the realm to use.
   */
  realm: WOTBRealm;
}
