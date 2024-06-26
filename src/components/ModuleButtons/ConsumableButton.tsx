import { ClockIcon, ReloadIcon } from '@radix-ui/react-icons';
import { Flex, Text } from '@radix-ui/themes';
import { asset } from '../../core/blitzkit/asset';
import { useDelta } from '../../hooks/useDelta';
import { GenericTankComponentButton } from './GenericTankComponentButton';
import { TankComponentButtonProps } from './TankComponentButton';

interface ConsumableButtonProps extends TankComponentButtonProps {
  consumable: number;
  duration?: number;
  cooldown?: number;
}

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
      icon={asset(`icons/consumables/${consumable}.webp`)}
      style={{
        flex: 1,
        minWidth: 'fit-content',
        borderRadius: 0,
      }}
      {...props}
    >
      {(cooldown || duration) && (
        <Flex direction="column" style={{ transform: 'translateX(-10px)' }}>
          {duration && (
            <Text
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
