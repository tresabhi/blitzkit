import { Language, translations } from './strings';

export async function translator(language: Language) {
  const strings = await translations[language];

  function translate(key: string) {
    const path = key.split('.');
    let fragment = strings;

    for (const pathItem in path) {
      if (typeof fragment === 'string') {
        throw new SyntaxError(
          `Attempted to access sub-string ("${pathItem}" in "${path}") from a string instead of a tree`,
        );
      } else {
        fragment = fragment[pathItem];

        if (typeof fragment === 'undefined') {
          throw new Error(
            `Undefined translation for key "${key}" (in "${path}") in language "${language}"`,
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
        `Unresolved tree ending for path "${path}" in language "${language}"`,
      );
    }
  }

  function t(strings: TemplateStringsArray) {
    return translate(strings[0]);
  }

  return { translate, t };
}
