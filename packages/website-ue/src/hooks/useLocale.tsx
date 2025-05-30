import locales from '@blitzkit/i18n/locales.json' with { type: 'json' };
import type { BlitzKitStrings } from 'packages/i18n/src';
import { createContext, use, useContext } from 'react';

const LocaleContext = createContext<{
  locale: string;
  gameStrings: Record<string, string>;
} | null>(null);

export interface LocaleAcceptorProps {
  localeData: {
    locale: string;
    gameStrings?: Record<string, string>;
  };
}

interface LocaleProviderProps extends LocaleAcceptorProps {
  children: React.ReactNode;
}

export function LocaleProvider({ localeData, children }: LocaleProviderProps) {
  const isSupported = locales.supported.some(
    (supported) => supported.locale === localeData.locale,
  );

  if (!isSupported) throw new Error(`Unsupported locale: ${localeData.locale}`);

  return (
    <LocaleContext.Provider
      value={{
        locale: localeData.locale,
        gameStrings: localeData.gameStrings ?? {},
      }}
    >
      {children}
    </LocaleContext.Provider>
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
  const localeData = useContext(LocaleContext);

  if (localeData === null) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }

  const strings = use(loadLocale(localeData.locale));

  return { ...localeData, strings };
}
