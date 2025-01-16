import {} from '@blitzkit/core';
import {
  DEFAULT_LOCALE,
  STRINGS,
  SUPPORTED_LOCALES,
  SUPPORTED_LOCALE_FLAGS,
} from '@blitzkit/i18n';
import { Select } from '@radix-ui/themes';
import type { LocaleAcceptorProps } from '../hooks/useLocale';
import { BlitzKitTheme } from './BlitzKitTheme';

export function LocaleSwitcherThemeWrapper({ locale }: LocaleAcceptorProps) {
  return (
    <BlitzKitTheme style={{ background: 'transparent' }}>
      <LocaleSwitcher locale={locale} />
    </BlitzKitTheme>
  );
}

export function LocaleSwitcher({ locale }: LocaleAcceptorProps) {
  return (
    <Select.Root
      defaultValue={locale}
      onValueChange={(locale) => {
        localStorage.setItem('preferred-locale', locale);

        let rawPath = window.location.pathname;

        for (const supportedLocale of SUPPORTED_LOCALES) {
          if (window.location.pathname.startsWith(`/${supportedLocale}`)) {
            rawPath = rawPath.replace(`/${supportedLocale}`, '');
            break;
          }
        }

        window.location.pathname = `${
          locale === DEFAULT_LOCALE ? '' : `/${locale}`
        }${rawPath}`;
      }}
    >
      <Select.Trigger />

      <Select.Content>
        {SUPPORTED_LOCALES.map((locale) => (
          <Select.Item key={locale} value={locale}>
            {SUPPORTED_LOCALE_FLAGS[locale]}{' '}
            {STRINGS[locale].common.locales[locale]}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
