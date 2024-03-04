const LANGUAGES = ['en-US', 'es-ES', 'ja-JP'] as const;

export type Language = (typeof LANGUAGES)[number];
export type TranslationFragmentTree = {
  [key: string]: TranslationFragment;
} & {
  $?: string;
};
export type TranslationFragment = string | TranslationFragmentTree;

export const translations = LANGUAGES.reduce(
  (table, language) => ({
    ...table,
    [language]: import(`../../lang/${language}.json`),
  }),
  {},
) as Record<Language, Promise<TranslationFragment>>;
