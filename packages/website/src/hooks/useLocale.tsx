import { type BlitzKitStrings } from '@blitzkit/i18n';
import { createContext, useContext, type ReactNode } from 'react';

interface LocaleContextContent {
  locale: string;
  strings: BlitzKitStrings;
  gameStrings: Record<string, string>;
}

type LocaleContextData = Omit<LocaleContextContent, 'gameStrings'> & {
  gameStrings?: Record<string, string>;
};

const LocaleContext = createContext<LocaleContextContent | null>(null);

interface LocaleProviderProps {
  data: LocaleContextData;
  children: ReactNode;
}

export function LocaleProvider({ data, children }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={{ gameStrings: {}, ...data }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }

  return context;
}

export interface LocaleAcceptorProps {
  localeContext: LocaleContextContent;
}
