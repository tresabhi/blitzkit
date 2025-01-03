import en from '@blitzkit/core/lang/en.json';
import ru from '@blitzkit/core/lang/ru.json';

type TranslationTree = { [key: string]: Translation };

type Translation = string | TranslationTree;

type NestedKeys<Type> = Type extends object
  ? {
      [Key in keyof Type]: Key extends string
        ? Type[Key] extends object
          ? '$' extends keyof Type[Key]
            ? `${Key}` | `${Key}.${NestedKeys<Type[Key]>}`
            : `${Key}.${NestedKeys<Type[Key]>}`
          : Key
        : never;
    }[keyof Type]
  : never;

class Prate<
  Locale extends string,
  DefaultLocale extends Locale,
  Strings extends TranslationTree,
  Path extends NestedKeys<Strings>,
> {
  private readonly defaultStrings: Map<string, string>;

  constructor(
    public strings: Record<Locale, Strings>,
    public defaultLocale: DefaultLocale,
  ) {
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
    if (this.strings[locale] === undefined) {
      throw new TypeError(`Locale "${locale}" is not defined`);
    }

    const strings = this.strings[locale];
    const defaultStrings = this.defaultStrings;
    const defaultLocale = this.defaultLocale;

    const translations = this.flatten(strings);

    function translate(path: Path, literals?: string[]) {
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

    return { translate, t: translate };
  }
}

const prate = new Prate({ en, ru }, 'en');
