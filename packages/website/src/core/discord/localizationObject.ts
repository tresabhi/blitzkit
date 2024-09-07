import { Locale } from 'discord.js';
import { SUPPORTED_LOCALES } from '../localization/strings/constants';
import { translator } from '../localization/translator';

export function localizationObject(path: string, literals?: string[]) {
  return SUPPORTED_LOCALES.reduce<Partial<Record<Locale, string>>>(
    (localizations, locale) => {
      const { translate } = translator(locale);
      return {
        ...localizations,
        [locale]: translate(path, literals),
      };
    },
    {},
  );
}
