import { Flex } from '@radix-ui/themes';
import { TankopediaEphemeral } from '../../stores/tankopediaEphemeral';
import { ShotDisplayCard } from '../Armor/components/ShotDisplayCard';

export function ShotDisplaySection() {
  const shot = TankopediaEphemeral.use((state) => state.shot);

  if (!shot) return null;

  return (
    <Flex justify="center" display={{ initial: 'flex', sm: 'none' }}>
      <ShotDisplayCard shot={shot} />
    </Flex>
  );
}
