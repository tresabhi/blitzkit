import { Locale } from 'discord.js';
import { locales, translations } from './strings';

export function translator(localeRaw: Locale) {
  const locale = locales.includes(localeRaw) ? localeRaw : Locale.EnglishUS;
  const strings = translations[locale];

  function translate(path: string, literals?: string[]): string {
    const pathArray = path.split('.');
    let fragment = strings;
    let resolvedString: string;

    for (const pathItem of pathArray) {
      if (typeof fragment === 'string') {
        throw new SyntaxError(
          `Attempted to access string with key "${pathItem}" in "${path}" from within a string instead of an object in locale "${locale}"`,
        );
      } else {
        fragment = fragment[pathItem];

        if (typeof fragment === 'undefined') {
          if (locale === Locale.EnglishUS) {
            throw new Error(
              `Undefined translation at "${pathItem}" in "${path}" for locale "${locale}"`,
            );
          } else {
            console.warn(
              `Undefined translation at "${pathItem}" in "${path}" for locale "${locale}"; falling back to en-US`,
            );
            return translator(Locale.EnglishUS).translate(path, literals);
          }
        }
      }
    }

    if (typeof fragment === 'string') {
      resolvedString = fragment;
    } else if (fragment.$) {
      resolvedString = fragment.$!;
    } else {
      throw new Error(
        `Unresolved tree ending for "${path}" in locale "${locale}"`,
      );
    }

    if (literals) {
      const chunks = resolvedString.split('%s');
      let embeddedString = '';

      chunks.forEach((chunk, index) => {
        if (index !== 0) embeddedString += literals[index - 1];
        embeddedString += chunk;
      });

      return embeddedString;
    }

    return resolvedString;
  }

  function t(paths: TemplateStringsArray, ...embeds: string[]) {
    return paths
      .map((path, index) =>
        path.length === 0
          ? ''
          : `${translate(path)}${index === embeds.length ? '' : embeds[index]}`,
      )
      .join('');
  }

  return { locale, translate, t };
}
