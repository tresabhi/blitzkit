import { DEFAULT_LOCALE } from '@blitzkit/i18n';
import { GlobeIcon } from '@radix-ui/react-icons';
import { Flex, Text } from '@radix-ui/themes';
import type { LocaleAcceptorProps } from '../../hooks/useLocale';
import { BlitzKitTheme } from '../BlitzKitTheme';
import { LocaleSwitcher } from '../LocaleSwitcher';

export function HomeLocaleSwitcher({
  locale = DEFAULT_LOCALE,
}: LocaleAcceptorProps) {
  return (
    <BlitzKitTheme>
      <Flex justify="center" mt="4" py="6" align="center" gap="3">
        <Text size="5" trim="end" color="gray">
          <GlobeIcon width="1em" height="1em" />
        </Text>

        <LocaleSwitcher locale={locale} />
      </Flex>
    </BlitzKitTheme>
  );
}
