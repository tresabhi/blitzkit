import { Flex, Heading, Switch, Text } from '@radix-ui/themes';
import { PageWrapper } from '../../components/PageWrapper';
import { App } from '../../stores/app';

export function Page() {
  return (
    <App.Provider>
      <Content />
    </App.Provider>
  );
}

function Content() {
  const developerMode = App.useDeferred((state) => state.developerMode, false);
  const appStore = App.useStore();

  return (
    <PageWrapper justify="center" align="center">
      <Flex direction="column" gap="4">
        <Flex gap="3" direction="column">
          <Heading size="5">Advanced</Heading>

          <Flex align="center" gap="2">
            <Text>Developer mode</Text>
            <Switch
              checked={developerMode}
              onCheckedChange={(checked) =>
                appStore.setState({ developerMode: checked })
              }
            />
          </Flex>
        </Flex>
      </Flex>
    </PageWrapper>
  );
}
