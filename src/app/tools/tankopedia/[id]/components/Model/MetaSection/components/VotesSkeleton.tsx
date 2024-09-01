import { Button, Flex, Heading, Skeleton, Text } from '@radix-ui/themes';
import { WargamingLoginButton } from '../../../../../../../../components/Navbar/components/WargamingLoginButton';
import * as App from '../../../../../../../../stores/app';

export function VotesSkeleton() {
  const wargaming = App.useDeferred(
    undefined,
    (state) => state.logins.wargaming,
  );

  return (
    <Flex direction="column" gap="3">
      <Flex justify="between" align="end">
        <Heading size="4">
          <Skeleton height="1em" width="6rem" />
        </Heading>

        {!wargaming && (
          <WargamingLoginButton variant="outline">
            Login to vote
          </WargamingLoginButton>
        )}
        {wargaming && <Button>Vote</Button>}
      </Flex>

      <Flex gap="0" direction="column">
        <Flex gap="6">
          <Flex align="center" justify="between" width="15rem">
            <Text>Easiness</Text>
            <Skeleton height="1em" width="5rem" />
          </Flex>
          <Flex align="center" justify="between" width="15rem">
            <Text>Firepower</Text>
            <Skeleton height="1em" width="5rem" />
          </Flex>
        </Flex>
        <Flex gap="6">
          <Flex align="center" justify="between" width="15rem">
            <Text>Maneuverability</Text>
            <Skeleton height="1em" width="5rem" />
          </Flex>
          <Flex align="center" justify="between" width="15rem">
            <Text>Survivability</Text>
            <Skeleton height="1em" width="5rem" />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
