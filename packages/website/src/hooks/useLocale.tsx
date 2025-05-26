import locales from '@blitzkit/i18n/locales.json' with { type: 'json' };
import type { BlitzKitStrings } from 'packages/i18n/src';
import { createContext, use, useContext } from 'react';
const LocaleContext = createContext<string | null>(null);

interface LocaleProviderProps {
  locale: string;
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

export function useLocale() {
  const locale = useContext(LocaleContext);
  const strings = use<BlitzKitStrings>(
    fetch(`/api/strings/${locale}.json`).then((response) => response.json()),
  );

  return { locale, strings };
}
