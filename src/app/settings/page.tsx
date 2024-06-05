'use client';

import { Flex, Heading, Switch, Text } from '@radix-ui/themes';
import PageWrapper from '../../components/PageWrapper';
import { useApp } from '../../stores/app';

export default function Page() {
  const developerMode = useApp((state) => state.developerMode);

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
                useApp.setState({ developerMode: checked })
              }
            />
          </Flex>
        </Flex>
      </Flex>
    </PageWrapper>
  );
}
