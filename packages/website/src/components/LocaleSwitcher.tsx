import {
  DEFAULT_LOCALE,
  localizedStrings,
  SUPPORTED_LOCALE_FLAGS,
  SUPPORTED_LOCALES,
} from '@blitzkit/core';
import { GlobeIcon } from '@radix-ui/react-icons';
import { Flex, Select, Text } from '@radix-ui/themes';
import type { LocaleAcceptorProps } from '../hooks/useLocale';
import { BlitzKitTheme } from './BlitzKitTheme';

export function LocaleSwitcher({ locale }: LocaleAcceptorProps) {
  return (
    <BlitzKitTheme>
      <Flex justify="center" mt="4" py="6" align="center" gap="3">
        <Text size="5" trim="end" color="gray">
          <GlobeIcon width="1em" height="1em" />
        </Text>

        <Select.Root
          defaultValue={locale}
          onValueChange={(locale) => {
            localStorage.setItem('preferred-locale', locale);
            window.location.pathname = `/${locale === DEFAULT_LOCALE ? '' : locale}`;
          }}
        >
          <Select.Trigger />

          <Select.Content>
            {SUPPORTED_LOCALES.map((locale) => (
              <Select.Item key={locale} value={locale}>
                {SUPPORTED_LOCALE_FLAGS[locale]}{' '}
                {localizedStrings[locale].common.locales[locale]}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>
    </BlitzKitTheme>
  );
}
