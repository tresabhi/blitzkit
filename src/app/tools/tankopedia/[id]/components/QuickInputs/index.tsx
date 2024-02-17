import { Flex, TextField } from '@radix-ui/themes';
import { use, useEffect, useRef } from 'react';
import { applyPitchYawLimits } from '../../../../../../core/blitz/applyPitchYawLimits';
import { modelDefinitions } from '../../../../../../core/blitzkrieg/modelDefinitions';
import { modelTransformEvent } from '../../../../../../core/blitzkrieg/modelTransform';
import { useEquipment } from '../../../../../../hooks/useEquipment';
import { useDuel } from '../../../../../../stores/duel';
import {
  mutateTankopediaTemporary,
  useTankopediaTemporary,
} from '../../../../../../stores/tankopedia';
import { QuickEquipmentButton } from './components/QuickEquipmentButton';

export function RotationInputs() {
  const protagonist = useDuel((state) => state.protagonist!);
  const physical = useTankopediaTemporary((state) => state.model.pose);
  const awaitedModelDefinitions = use(modelDefinitions);
  const turretYawInput = useRef<HTMLInputElement>(null);
  const gunPitchInput = useRef<HTMLInputElement>(null);
  const mode = useTankopediaTemporary((state) => state.mode);
  const hasCalibratedShells = useEquipment(103);
  const hasEnhancedArmor = useEquipment(110);

  useEffect(() => {
    turretYawInput.current!.value = `${-Math.round(
      physical.yaw * (180 / Math.PI),
    )}`;
  }, [physical.yaw]);
  useEffect(() => {
    gunPitchInput.current!.value = `${-Math.round(
      physical.pitch * (180 / Math.PI),
    )}`;
  }, [physical.pitch]);

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
        bottom: 8,
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
            defaultValue={Math.round(physical.yaw * (180 / Math.PI))}
            onBlur={() => {
              const [pitch, yaw] = applyPitchYawLimits(
                physical.pitch,
                -Number(turretYawInput.current?.value) * (Math.PI / 180),
                gunModelDefinition.pitch,
                turretModelDefinition.yaw,
              );
              modelTransformEvent.emit({ pitch, yaw });
              mutateTankopediaTemporary((state) => {
                state.model.pose.pitch = pitch;
                state.model.pose.yaw = yaw;
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
            defaultValue={-Math.round(physical.pitch * (180 / Math.PI))}
            onBlur={() => {
              const [pitch, yaw] = applyPitchYawLimits(
                -Number(gunPitchInput.current?.value) * (Math.PI / 180),
                physical.yaw,
                gunModelDefinition.pitch,
                turretModelDefinition.yaw,
              );
              modelTransformEvent.emit({ pitch, yaw });
              mutateTankopediaTemporary((state) => {
                state.model.pose.pitch = pitch;
                state.model.pose.yaw = yaw;
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
              mutateTankopediaTemporary((draft) => {
                draft.equipmentMatrix[0][0] = hasCalibratedShells ? 0 : 1;
              });
            }}
          />
          <QuickEquipmentButton
            equipment={110}
            active={hasEnhancedArmor}
            onClick={() => {
              mutateTankopediaTemporary((draft) => {
                draft.equipmentMatrix[1][1] = hasEnhancedArmor ? 0 : -1;
              });
            }}
          />
        </Flex>
      )}
    </Flex>
  );
}
