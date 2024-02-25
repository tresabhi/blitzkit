import { Flex, TextField } from '@radix-ui/themes';
import { use, useEffect, useRef } from 'react';
import { applyPitchYawLimits } from '../../../../../../core/blitz/applyPitchYawLimits';
import { modelDefinitions } from '../../../../../../core/blitzkrieg/modelDefinitions';
import { modelTransformEvent } from '../../../../../../core/blitzkrieg/modelTransform';
import { useEquipment } from '../../../../../../hooks/useEquipment';
import { mutateDuel, useDuel } from '../../../../../../stores/duel';
import { useTankopediaPersistent } from '../../../../../../stores/tankopedia';
import { QuickEquipmentButton } from './components/QuickEquipmentButton';

interface RotationInputsProps {
  isFullScreen?: boolean;
}

export function RotationInputs({ isFullScreen }: RotationInputsProps) {
  const protagonist = useDuel((state) => state.protagonist!);
  const awaitedModelDefinitions = use(modelDefinitions);
  const turretYawInput = useRef<HTMLInputElement>(null);
  const gunPitchInput = useRef<HTMLInputElement>(null);
  const mode = useTankopediaPersistent((state) => state.mode);
  const hasCalibratedShells = useEquipment(103, true);
  const hasEnhancedArmor = useEquipment(110);

  useEffect(() => {
    turretYawInput.current!.value = `${-Math.round(
      protagonist.yaw * (180 / Math.PI),
    )}`;
  }, [protagonist.yaw]);
  useEffect(() => {
    gunPitchInput.current!.value = `${-Math.round(
      protagonist.pitch * (180 / Math.PI),
    )}`;
  }, [protagonist.pitch]);

  const tankModelDefinition = awaitedModelDefinitions[protagonist.tank.id];
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];

  return (
    <Flex
      justify="center"
      align="center"
      style={{
        width: 'calc(100% - 16px)',
        position: 'absolute',
        left: 8,
        bottom: isFullScreen ? 80 : 8,
      }}
      gap="4"
    >
      <Flex
        gap="2"
        style={{
          width: 256,
        }}
      >
        <TextField.Root
          style={{
            flex: 1,
          }}
        >
          <TextField.Slot
            style={{
              userSelect: 'none',
            }}
          >
            Yaw
          </TextField.Slot>
          <TextField.Input
            defaultValue={Math.round(protagonist.yaw * (180 / Math.PI))}
            onBlur={() => {
              const [pitch, yaw] = applyPitchYawLimits(
                protagonist.pitch,
                -Number(turretYawInput.current?.value) * (Math.PI / 180),
                gunModelDefinition.pitch,
                turretModelDefinition.yaw,
              );
              modelTransformEvent.emit({ pitch, yaw });
              mutateDuel((state) => {
                state.protagonist!.pitch = pitch;
                state.protagonist!.yaw = yaw;
              });
              turretYawInput.current!.value = `${Math.round(
                yaw * (180 / Math.PI),
              )}`;
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                turretYawInput.current?.blur();
              }
            }}
            onFocus={() => turretYawInput.current?.focus()}
            ref={turretYawInput}
            style={{ textAlign: 'right' }}
          />
          <TextField.Slot
            style={{
              userSelect: 'none',
            }}
          >
            °
          </TextField.Slot>
        </TextField.Root>

        <TextField.Root
          style={{
            flex: 1,
          }}
        >
          <TextField.Slot
            style={{
              userSelect: 'none',
            }}
          >
            Pitch
          </TextField.Slot>
          <TextField.Input
            defaultValue={-Math.round(protagonist.pitch * (180 / Math.PI))}
            onBlur={() => {
              const [pitch, yaw] = applyPitchYawLimits(
                -Number(gunPitchInput.current?.value) * (Math.PI / 180),
                protagonist.yaw,
                gunModelDefinition.pitch,
                turretModelDefinition.yaw,
              );
              modelTransformEvent.emit({ pitch, yaw });
              mutateDuel((state) => {
                state.protagonist!.pitch = pitch;
                state.protagonist!.yaw = yaw;
              });
              gunPitchInput.current!.value = `${Math.round(
                pitch * (180 / Math.PI),
              )}`;
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                gunPitchInput.current?.blur();
              }
            }}
            onFocus={() => gunPitchInput.current?.focus()}
            ref={gunPitchInput}
            style={{ textAlign: 'right' }}
          />
          <TextField.Slot
            style={{
              userSelect: 'none',
            }}
          >
            °
          </TextField.Slot>
        </TextField.Root>
      </Flex>

      {mode === 'armor' && (
        <Flex gap="4">
          <QuickEquipmentButton
            equipment={103}
            active={hasCalibratedShells}
            onClick={() => {
              mutateDuel((draft) => {
                draft.antagonist!.equipment[0][0] = hasCalibratedShells ? 0 : 1;
              });
            }}
          />
          <QuickEquipmentButton
            equipment={110}
            active={hasEnhancedArmor}
            onClick={() => {
              mutateDuel((draft) => {
                draft.protagonist!.equipment[1][1] = hasEnhancedArmor ? 0 : -1;
              });
            }}
          />
        </Flex>
      )}
    </Flex>
  );
}
