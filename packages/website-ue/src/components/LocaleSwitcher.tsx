import locales from '@blitzkit/i18n/locales.json' with { type: 'json' };
import { Select } from '@radix-ui/themes';
import { LOCALE_NAMES, SUPPORTED_LOCALE_FLAGS } from 'packages/i18n/src';
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

        for (const supportedLocale of locales.supported) {
          if (
            window.location.pathname.startsWith(`/${supportedLocale.locale}`)
          ) {
            rawPath = rawPath.replace(`/${supportedLocale.locale}`, '');
            break;
          }
        }

        window.location.pathname = `${
          locale === locales.default ? '' : `/${locale}`
        }${rawPath}`;
      }}
    >
      <Select.Trigger variant="classic" />

      <Select.Content>
        {locales.supported.map(({ locale }) => (
          <Select.Item key={locale} value={locale}>
            {SUPPORTED_LOCALE_FLAGS[locale]} {LOCALE_NAMES[locale]}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
