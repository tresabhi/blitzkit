import { Locale } from 'discord.js';
import { translations } from './strings';

export async function translator(locale: Locale) {
  const strings = (await translations)[locale];

  function translate(path: string) {
    const pathArray = path.split('.');
    let fragment = strings;

    for (const pathItem of pathArray) {
      if (typeof fragment === 'string') {
        throw new SyntaxError(
          `Attempted to access sub-string ("${pathItem}" in "${path}") from a string instead of a tree`,
        );
      } else {
        fragment = fragment[pathItem];

        if (typeof fragment === 'undefined') {
          throw new Error(
            `Undefined translation for key "${path}" (in "${path}") in language "${locale}"`,
          );
        }
      }
    }

    if (typeof fragment === 'string') {
      return fragment;
    } else if (fragment.$) {
      return fragment.$!;
    } else {
      throw new Error(
        `Unresolved tree ending for "${path}" in language "${locale}"`,
      );
    }
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

  return { translate, t };
}
