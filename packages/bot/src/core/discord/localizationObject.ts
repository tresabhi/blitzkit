import { Locale } from 'discord.js';
import { SUPPORTED_LOCALES } from '../localization/strings/constants';
import { translator } from '../localization/translator';

const validNameRegex = /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

export function localizationObject(
  path: string,
  literals?: string[],
  strict = false,
) {
  return SUPPORTED_LOCALES.reduce<Partial<Record<Locale, string>>>(
    (localizations, locale) => {
      const { translate } = translator(locale);
      const translation = translate(path, literals);
      const isValid = !strict || validNameRegex.test(translation);

      if (!isValid) {
        console.warn(
          `Invalid localization for ${locale} (${path}): ${translation}; skipping...`,
        );
        return localizations;
      }

      return {
        ...localizations,
        [locale]: translation,
      };
    },
    {},
  );
}
