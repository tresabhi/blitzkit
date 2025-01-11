import { DEFAULT_LOCALE } from '@blitzkit/core';
import { Flex, Switch, Text } from '@radix-ui/themes';
import { LocaleSwitcher } from '../../../components/LocaleSwitcher';
import { PageWrapper } from '../../../components/PageWrapper';
import {
  LocaleProvider,
  useLocale,
  type LocaleAcceptorProps,
} from '../../../hooks/useLocale';
import { App } from '../../../stores/app';

export function Page({ locale = DEFAULT_LOCALE }: LocaleAcceptorProps) {
  return (
    <LocaleProvider locale={locale}>
      <App.Provider>
        <Content locale={locale} />
      </App.Provider>
    </LocaleProvider>
  );
}

function Content({ locale }: LocaleAcceptorProps) {
  const developerMode = App.useDeferred((state) => state.developerMode, false);
  const appStore = App.useStore();
  const { strings } = useLocale();

  return (
    <PageWrapper justify="center" align="center">
      <Flex gap="3" direction="column" width="100%" maxWidth="20rem">
        <Flex align="center" gap="2" justify="between">
          <Text>{strings.website.settings.dev_mode}</Text>
          <Switch
            checked={developerMode}
            onCheckedChange={(checked) =>
              appStore.setState({ developerMode: checked })
            }
          />
        </Flex>

        <Flex align="center" gap="2" justify="between">
          <Text>{strings.website.settings.language}</Text>
          <LocaleSwitcher locale={locale} />
        </Flex>
      </Flex>
    </PageWrapper>
  );
}
