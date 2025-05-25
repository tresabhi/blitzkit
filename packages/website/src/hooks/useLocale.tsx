import { type BlitzKitStrings } from '@blitzkit/i18n';
import { createContext, useContext, type ReactNode } from 'react';

const LocaleContext = createContext<{
  locale: string;
  strings: BlitzKitStrings;
} | null>(null);

interface LocaleProviderProps {
  locale: string;
  strings: BlitzKitStrings;
  children: ReactNode;
}

export function LocaleProvider({
  locale,
  strings,
  children,
}: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={{ locale, strings }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }

  const { locale, strings } = context;

  return { locale, strings };
}

export interface LocaleAcceptorProps {
  localeContext: { locale: string; strings: BlitzKitStrings };
}
