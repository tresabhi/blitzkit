import { Locale } from 'discord.js';
import { locales } from '../localization/strings';
import { translator } from '../localization/translator';

export async function localizationObject(path: string) {
  return (
    await Promise.all(locales.map(async (locale) => await translator(locale)))
  ).reduce<Partial<Record<Locale, string>>>(
    (localizations, { locale, translate }) => {
      return {
        ...localizations,
        [locale]: translate(path),
      };
    },
    {},
  );
}
