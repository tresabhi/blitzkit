import { Locale } from 'discord.js';
import { locales } from '../localization/strings';
import { translator } from '../localization/translator';

export function localizationObject(path: string) {
  return locales.reduce<Partial<Record<Locale, string>>>(
    (localizations, locale) => {
      const { translate } = translator(locale);
      return {
        ...localizations,
        [locale]: translate(path),
      };
    },
    {},
  );
}
