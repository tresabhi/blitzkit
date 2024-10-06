import { asset, fetchConsumableDefinitions } from '@blitzkit/core';
import { ClockIcon, ReloadIcon } from '@radix-ui/react-icons';
import { Flex, Text } from '@radix-ui/themes';
import { useDelta } from '../../hooks/useDelta';
import { GenericTankComponentButton } from './GenericTankComponentButton';
import type { TankComponentButtonProps } from './TankComponentButton';

interface ConsumableButtonProps extends TankComponentButtonProps {
  consumable: number;
  duration?: number;
  cooldown?: number;
}

const consumableDefinitions = await fetchConsumableDefinitions();

export function ConsumableButton({
  consumable,
  cooldown,
  duration,
  ...props
}: ConsumableButtonProps) {
  const cooldownDelta = useDelta(cooldown ?? 0);
  const durationDelta = useDelta(duration ?? 0);

  return (
    <GenericTankComponentButton
      style={{ width: '6rem' }}
      tooltip={consumableDefinitions.consumables[consumable].name}
      icon={asset(`icons/consumables/${consumable}.webp`)}
      {...props}
    >
      {(cooldown || duration) && (
        <Flex direction="column" gap="1" ml="-2" mr="2">
          {duration && (
            <Text
              size="1"
              color={
                durationDelta > 0
                  ? 'green'
                  : durationDelta < 0
                    ? 'tomato'
                    : undefined
              }
            >
              <Flex align="center" gap="1" style={{ marginBottom: -4 }}>
                <ClockIcon width={12} height={12} />
                {Math.round(duration)}s
              </Flex>
            </Text>
          )}
          {cooldown && (
            <Text
              size="1"
              color={
                cooldownDelta < 0
                  ? 'green'
                  : cooldownDelta > 0
                    ? 'tomato'
                    : undefined
              }
            >
              <Flex align="center" gap="1">
                <ReloadIcon width={12} height={12} />
                {Math.round(cooldown)}s
              </Flex>
            </Text>
          )}
        </Flex>
      )}
    </GenericTankComponentButton>
  );
}
