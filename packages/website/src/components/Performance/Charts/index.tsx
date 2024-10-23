import { Flex } from '@radix-ui/themes';
import { PlayersByTierAndClass } from './components/PlayersByTierAndClass';

export function Charts() {
  return (
    <Flex justify="center">
      <Flex direction="column" maxWidth="45rem" flexGrow="1" py="6" gap="9">
        <PlayersByTierAndClass />
      </Flex>
    </Flex>
  );
}
