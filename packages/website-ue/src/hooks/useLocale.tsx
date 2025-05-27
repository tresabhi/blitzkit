import locales from '@blitzkit/i18n/locales.json' with { type: 'json' };
import type { BlitzKitStrings } from 'packages/i18n/src';
import { createContext, use, useContext } from 'react';
const LocaleContext = createContext<string | null>(null);

export interface LocaleAcceptorProps {
  locale: string;
}

interface LocaleProviderProps extends LocaleAcceptorProps {
  children: React.ReactNode;
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  const isSupported = locales.supported.some(
    (supported) => supported.locale === locale,
  );

  if (!isSupported) throw new Error(`Unsupported locale: ${locale}`);

  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

const strings = import.meta.glob('../../../i18n/strings/*.json', {
  import: 'default',
});
const cache = new Map<string, Promise<BlitzKitStrings>>();

function loadLocale(locale: string) {
  if (cache.has(locale)) return cache.get(locale)!;

  const promise = strings[
    `../../../i18n/strings/${locale}.json`
  ]() as Promise<BlitzKitStrings>;

  cache.set(locale, promise);

  return promise;
}

export function useLocale() {
  const locale = useContext(LocaleContext);

  if (locale === null) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }

  const strings = use(loadLocale(locale));

  return { locale, strings };
}
