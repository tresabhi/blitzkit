import { createContext, useContext, type ReactNode } from 'react';

const LocaleContext = createContext<{ locale: string | undefined } | null>(
  null,
);

interface LocaleProviderProps {
  locale: string | undefined;
  children: ReactNode;
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={{ locale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }

  return { locale: context.locale };
}
