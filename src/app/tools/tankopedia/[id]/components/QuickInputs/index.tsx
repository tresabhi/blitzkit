import { CaretSortIcon } from '@radix-ui/react-icons';
import { Flex, TextField } from '@radix-ui/themes';
import { use, useEffect, useRef } from 'react';
import { degToRad, radToDeg } from 'three/src/math/MathUtils';
import { applyPitchYawLimits } from '../../../../../../core/blitz/applyPitchYawLimits';
import { modelDefinitions } from '../../../../../../core/blitzkit/modelDefinitions';
import { modelTransformEvent } from '../../../../../../core/blitzkit/modelTransform';
import { useEquipment } from '../../../../../../hooks/useEquipment';
import { useFullScreen } from '../../../../../../hooks/useFullScreen';
import { mutateDuel, useDuel } from '../../../../../../stores/duel';
import * as styles from './index.css';

export function RotationInputs() {
  const protagonist = useDuel((state) => state.protagonist!);
  const awaitedModelDefinitions = use(modelDefinitions);
  const turretYawInput = useRef<HTMLInputElement>(null);
  const gunPitchInput = useRef<HTMLInputElement>(null);
  const tankModelDefinition = awaitedModelDefinitions[protagonist.tank.id];
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];
  const initialGunPitch = tankModelDefinition.turretRotation?.pitch ?? 0;
  const hasImprovedVerticalStabilizer = useEquipment(122);
  const isFullScreen = useFullScreen();

  useEffect(() => {
    turretYawInput.current!.value = radToDeg(protagonist.yaw).toFixed(1);
  }, [protagonist.yaw]);
  useEffect(() => {
    gunPitchInput.current!.value = (
      -radToDeg(protagonist.pitch) + initialGunPitch
    ).toFixed(1);
  }, [protagonist.pitch]);

  return (
    <Flex
      className={isFullScreen ? undefined : styles.container}
      gap="2"
      style={{
        width: 128 + 32,
        pointerEvents: 'auto',
        position: 'absolute',
        left: '50%',
        top: 16,
        transform: 'translateX(-50%)',
      }}
    >
      <TextField.Root
        size="1"
        radius="full"
        style={{
          flex: 1,
          textAlign: 'right',
        }}
        onBlur={() => {
          const value = Number(turretYawInput.current!.value);
          if (isNaN(value)) {
            turretYawInput.current!.value = radToDeg(protagonist.yaw).toFixed(
              1,
            );
            return;
          }
          const [pitch, yaw] = applyPitchYawLimits(
            protagonist.pitch,
            degToRad(value),
            gunModelDefinition.pitch,
            turretModelDefinition.yaw,
            hasImprovedVerticalStabilizer,
          );
          modelTransformEvent.emit({ pitch, yaw });
          mutateDuel((state) => {
            state.protagonist!.pitch = pitch;
            state.protagonist!.yaw = yaw;
          });
          turretYawInput.current!.value = radToDeg(protagonist.yaw).toFixed(1);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            turretYawInput.current?.blur();
          }
        }}
        onFocus={() => turretYawInput.current?.focus()}
        ref={turretYawInput}
      >
        <TextField.Slot
          style={{
            userSelect: 'none',
          }}
        >
          <CaretSortIcon style={{ transform: 'rotate(90deg)' }} />
        </TextField.Slot>
        <TextField.Slot style={{ userSelect: 'none' }}>°</TextField.Slot>
      </TextField.Root>

      <TextField.Root
        size="1"
        radius="full"
        style={{
          flex: 1,
          textAlign: 'right',
        }}
        onBlur={() => {
          const value = Number(gunPitchInput.current!.value);
          if (isNaN(value)) {
            gunPitchInput.current!.value = (
              -radToDeg(protagonist.pitch) + initialGunPitch
            ).toFixed(1);
            return;
          }
          const [pitch, yaw] = applyPitchYawLimits(
            degToRad(-value + initialGunPitch),
            protagonist.yaw,
            gunModelDefinition.pitch,
            turretModelDefinition.yaw,
            hasImprovedVerticalStabilizer,
          );
          modelTransformEvent.emit({ pitch, yaw });
          mutateDuel((state) => {
            state.protagonist!.pitch = pitch;
            state.protagonist!.yaw = yaw;
          });
          gunPitchInput.current!.value = (
            -radToDeg(protagonist.pitch) + initialGunPitch
          ).toFixed(1);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            gunPitchInput.current?.blur();
          }
        }}
        onFocus={() => gunPitchInput.current?.focus()}
        ref={gunPitchInput}
      >
        <TextField.Slot
          style={{
            userSelect: 'none',
          }}
        >
          <CaretSortIcon />
        </TextField.Slot>
        <TextField.Slot
          style={{
            userSelect: 'none',
          }}
        >
          °
        </TextField.Slot>
      </TextField.Root>
    </Flex>
  );
}
