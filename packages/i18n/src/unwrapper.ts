import { I18nString } from '@blitzkit/core';
import { DEFAULT_LOCALE } from './supportedLocales';

export function unwrapper(locale: string) {
  return function (i18nString: I18nString) {
    if (locale in i18nString.locales) {
      return i18nString.locales[locale];
    }

    return i18nString.locales[DEFAULT_LOCALE];
  };
}
