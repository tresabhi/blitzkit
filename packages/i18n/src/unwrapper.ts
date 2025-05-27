import { I18nString } from '@blitzkit/core';
import locales from '../locales.json' with { type: 'json' };

export function unwrapper(locale: string) {
  return function (i18nString: I18nString) {
    if (locale in i18nString.locales) {
      return i18nString.locales[locale];
    }

    return i18nString.locales[locales.default];
  };
}
