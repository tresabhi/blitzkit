import { merge } from 'lodash-es';
import type en from '../../lang/en.json';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../blitzkit';
import { TranslationTree } from './translator';

const files = import.meta.glob('../../lang/*.json', { eager: true });
export const localizedStrings: Record<string, typeof en> = {};

function nuke(object: TranslationTree) {
  for (const key in object) {
    const typedKey = key as keyof typeof object;

    if (typeof object[typedKey] === 'string') {
      const value = object[typedKey];
      object[typedKey] = redact(value as string);
    } else nuke(object[typedKey] as TranslationTree);
  }
}

SUPPORTED_LOCALES.forEach((locale) => {
  const defaultStrings = files[`../../lang/${DEFAULT_LOCALE}.json`];
  const strings = files[`../../lang/${locale}.json`];
  const mergedStrings = merge({}, defaultStrings, strings);

  /**
   * For some reason, this won't load on the server on the first render so I am
   * not asserting this one lol
   */
  if (import.meta.env.PUBLIC_DEBUG_MISSING_I18N === 'true') nuke(mergedStrings);

  localizedStrings[locale] = mergedStrings as typeof en;
});

function redact(string: string) {
  const matches = [...string.matchAll(/%s\d+/g)];
  const characters = string
    .split('')
    .map((char) => (char === ' ' ? ' ' : '█')) as string[];

  matches.forEach((match) => {
    const start = match.index;
    const matchText = match[0];
    for (let i = 0; i < matchText.length; i++) {
      characters[start + i] = matchText[i];
    }
  });

  return characters.join('');
}
