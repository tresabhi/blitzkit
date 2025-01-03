import en from '@blitzkit/core/lang/en.json';
import ru from '@blitzkit/core/lang/ru.json';

type Translation = string | TranslationTree;
type TranslationTree = { [key: string]: Translation };

// type Options<DefaultLocale extends string> = {
//   defaultLocale: DefaultLocale;
// };

// export function prate<
//   Locale extends string,
//   DefaultLocale extends Locale,
// >(
//   strings: Record<Locale, Translation>,
//   options: Partial<Options<DefaultLocale>>,
// ) {
//   function
// }

// const {prate }= prate({ en, ru }, { defaultLocale: 'en' });

class Prate<Locale extends string, DefaultLocale extends Locale> {
  private readonly strings = new Map<Locale, TranslationTree>();
  private readonly defaultStrings: Map<string, string>;

  constructor(
    strings: Record<Locale, TranslationTree>,
    public defaultLocale: DefaultLocale,
  ) {
    for (const locale in strings) {
      this.strings.set(locale, strings[locale]);
    }

    this.defaultStrings = this.flatten(strings[defaultLocale]);
  }

  private flatten(strings: TranslationTree) {
    const translations = new Map<string, string>();

    function traverse(parent: string, tree: Record<string, Translation>) {
      for (const key in tree) {
        const path = `${parent}${key}`;

        if (typeof tree[key] === 'string') {
          translations.set(path, tree[key]);
        } else {
          traverse(`${path}.`, tree[key]);
        }
      }
    }

    traverse('', strings);

    return translations;
  }

  locale(locale: Locale) {
    const strings = this.strings.get(locale);
    const defaultStrings = this.defaultStrings;
    const defaultLocale = this.defaultLocale;

    if (strings === undefined) {
      throw new TypeError(`Locale "${locale}" is not undefined`);
    }

    const translations = this.flatten(strings);

    function translate(path: string, literals?: string[]) {
      let translation = translations.get(path) ?? translations.get(`${path}.$`);

      if (translation === undefined) {
        translation =
          defaultStrings.get(path) ?? defaultStrings.get(`${path}.$`);

        if (translation === undefined) {
          throw new Error(
            `Undefined translation for "${path}" in locale "${locale}"; no fallback found in "${defaultLocale}"`,
          );
        }

        console.warn(
          `Undefined translation for "${path}" in locale "${locale}"; falling back to "${defaultLocale}"`,
        );
      }

      literals?.forEach((literal, index) => {
        translation = translation!.replaceAll(`%s${index + 1}`, literal);
      });

      return translation;
    }

    return { translate };
  }
}

const prate = new Prate({ en, ru }, 'en');

const { translate } = prate.locale('ru');

console.log(translate('bot.common.wn8'));
