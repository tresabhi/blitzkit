import { Flex } from '@radix-ui/themes';
import { ShotDisplayCard } from '../../../../../components/Armor/components/ShotDisplayCard';

export function ShotDisplaySection() {
  return (
    <Flex
      justify="center"
      display={{
        initial: 'flex',
        sm: 'none',
      }}
    >
      <ShotDisplayCard />
    </Flex>
  );
}
