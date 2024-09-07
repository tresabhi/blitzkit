import { Flex } from '@radix-ui/themes';
import { ShotDisplayCard } from '../../../../../components/Armor/components/ShotDisplayCard';
import * as TankEphemeral from '../../../../../stores/tankopediaEphemeral';

export function ShotDisplaySection() {
  const shot = TankEphemeral.use((state) => state.shot);

  if (!shot) return null;

  return (
    <Flex justify="center" display={{ initial: 'flex', sm: 'none' }}>
      <ShotDisplayCard shot={shot} />
    </Flex>
  );
}
