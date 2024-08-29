import { Flex, Heading, Text } from '@radix-ui/themes';
import { WargamingLoginButton } from '../../../../../../components/Navbar/components/WargamingLoginButton';
import * as App from '../../../../../../stores/app';
import { Stars } from './components/Stars';

export function VotingSection() {
  const wargaming = App.use((state) => state.logins.wargaming);

  return (
    <Flex direction="column" align="center" gap="4">
      <Flex direction="column" align="center">
        <Heading>User poll</Heading>
        <Flex align="center" gap="2">
          1.4K votes
        </Flex>
      </Flex>

      <Flex gap="0" direction="column">
        <Flex gap="6">
          <Flex align="center" justify="between" width="13rem">
            <Text>Difficulty</Text>
            <Stars lowerIsBetter stars={4} />
          </Flex>
          <Flex align="center" justify="between" width="13rem">
            <Text>Firepower</Text>
            <Stars stars={4} />
          </Flex>
        </Flex>
        <Flex gap="6">
          <Flex align="center" justify="between" width="13rem">
            <Text>Maneuverability</Text>
            <Stars stars={5} />
          </Flex>
          <Flex align="center" justify="between" width="13rem">
            <Text>Survivability</Text>
            <Stars stars={1} />
          </Flex>
        </Flex>
      </Flex>

      {!wargaming && (
        <Flex align="center" gap="2">
          <Text color="gray">Sign in to vote</Text>
          <WargamingLoginButton />
        </Flex>
      )}
    </Flex>
  );
}
