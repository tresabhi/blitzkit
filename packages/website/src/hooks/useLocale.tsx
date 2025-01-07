import { DEFAULT_LOCALE } from '@blitzkit/core';
import { createContext, useContext, type ReactNode } from 'react';
import { getStrings } from '../core/i18n/getStrings';

const LocaleContext = createContext<{
  locale: string;
  localeRaw: string | undefined;
} | null>(null);

interface LocaleProviderProps {
  locale: string | undefined;
  children: ReactNode;
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider
      value={{ locale: locale ?? DEFAULT_LOCALE, localeRaw: locale }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }

  const strings = getStrings(context.locale);

  return { locale: context.locale, strings };
}
