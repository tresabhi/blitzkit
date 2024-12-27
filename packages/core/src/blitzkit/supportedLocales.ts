export const SUPPORTED_LOCALES = ['en', 'es', 'hr', 'ru', 'uk', 'cn'];
export const DEFAULT_LOCALE = SUPPORTED_LOCALES[0];
export const LOCALE_FILES: Record<(typeof SUPPORTED_LOCALES)[number], string> =
  {
    en: 'en-US',
    es: 'es-ES',
    hr: 'hr',
    ru: 'ru',
    uk: 'uk',
    cn: 'zh-CN',
  };
