import { HeightIcon, WidthIcon } from '@radix-ui/react-icons';
import { Box, Flex, TextField } from '@radix-ui/themes';
import { use, useEffect, useRef } from 'react';
import { degToRad, radToDeg } from 'three/src/math/MathUtils';
import { applyPitchYawLimits } from '../../../../../../core/blitz/applyPitchYawLimits';
import { modelDefinitions } from '../../../../../../core/blitzkit/modelDefinitions';
import {
  modelTransformEvent,
  ModelTransformEventData,
} from '../../../../../../core/blitzkit/modelTransform';
import { useEquipment } from '../../../../../../hooks/useEquipment';
import { useFullScreen } from '../../../../../../hooks/useFullScreen';
import * as Duel from '../../../../../../stores/duel';
import * as TankopediaPersistent from '../../../../../../stores/tankopediaPersistent';
import * as styles from './index.css';

export function RotationInputs() {
  const mutateDuel = Duel.useMutation();
  const protagonist = Duel.use((state) => state.protagonist);
  const awaitedModelDefinitions = use(modelDefinitions);
  const yawInput = useRef<HTMLInputElement>(null);
  const pitchInput = useRef<HTMLInputElement>(null);
  const tankModelDefinition = awaitedModelDefinitions[protagonist.tank.id];
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];
  const initialGunPitch = tankModelDefinition.turretRotation?.pitch ?? 0;
  const hasImprovedVerticalStabilizer = useEquipment(122);
  const isFullScreen = useFullScreen();
  const mode = TankopediaPersistent.use((state) => state.mode);
  const armorMode = TankopediaPersistent.use((state) => state.armorMode);
  const mutateTankopediaPersistent = TankopediaPersistent.useMutation();

  useEffect(() => {
    yawInput.current!.value = radToDeg(protagonist.yaw).toFixed(1);
  }, [protagonist.yaw]);
  useEffect(() => {
    pitchInput.current!.value = (
      -radToDeg(protagonist.pitch) + initialGunPitch
    ).toFixed(1);
  }, [protagonist.pitch]);
  useEffect(() => {
    function handleTransformEvent({ pitch, yaw }: ModelTransformEventData) {
      if (!pitchInput.current || !yawInput.current) return;

      pitchInput.current.value = (
        -radToDeg(pitch) + (tankModelDefinition.turretRotation?.pitch ?? 0)
      ).toFixed(1);

      if (yaw === undefined) return;

      yawInput.current.value = radToDeg(yaw).toFixed(1);
    }

    modelTransformEvent.on(handleTransformEvent);

    return () => {
      modelTransformEvent.off(handleTransformEvent);
    };
  }, []);

  return (
    <Flex
      className={
        isFullScreen || mode === 'armor' ? undefined : styles.container
      }
      style={{
        width: 128 + 32,
        pointerEvents: 'auto',
        position: 'absolute',
        left: '50%',
        top: 16,
        transform: 'translateX(-50%)',
      }}
      direction="column"
      align="center"
      gap="2"
    >
      <Flex gap="2">
        <TextField.Root
          size="1"
          radius="full"
          style={{
            flex: 1,
            textAlign: 'right',
          }}
          onBlur={() => {
            const value = Number(yawInput.current!.value);
            if (isNaN(value)) {
              yawInput.current!.value = radToDeg(protagonist.yaw).toFixed(1);
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
              state.protagonist.pitch = pitch;
              state.protagonist.yaw = yaw;
            });
            yawInput.current!.value = radToDeg(protagonist.yaw).toFixed(1);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              yawInput.current?.blur();
            }
          }}
          onFocus={() => yawInput.current?.focus()}
          ref={yawInput}
        >
          <TextField.Slot
            style={{
              userSelect: 'none',
            }}
          >
            <WidthIcon />
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
            const value = Number(pitchInput.current!.value);
            if (isNaN(value)) {
              pitchInput.current!.value = (
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
              state.protagonist.pitch = pitch;
              state.protagonist.yaw = yaw;
            });
            pitchInput.current!.value = (
              -radToDeg(protagonist.pitch) + initialGunPitch
            ).toFixed(1);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              pitchInput.current?.blur();
            }
          }}
          onFocus={() => pitchInput.current?.focus()}
          ref={pitchInput}
        >
          <TextField.Slot
            style={{
              userSelect: 'none',
            }}
          >
            <HeightIcon />
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

      <Flex gap="2">
        <Box
          width="var(--space-6)"
          height="var(--space-4)"
          style={{
            borderRadius: 'var(--radius-1)',
            background: 'linear-gradient(90deg, #FF2020, #FF8080)',
            opacity: armorMode === 'blitz' ? 1 : 0.5,
          }}
          onClick={() => {
            mutateTankopediaPersistent((draft) => {
              draft.armorMode = 'blitz';
            });
          }}
        />
        <Flex
          width="var(--space-6)"
          height="var(--space-4)"
          style={{
            borderRadius: 'var(--radius-1)',
            overflow: 'hidden',
            opacity: armorMode === 'static' ? 1 : 0.5,
          }}
          onClick={() => {
            mutateTankopediaPersistent((draft) => {
              draft.armorMode = 'static';
            });
          }}
        >
          <Box flexGrow="1" style={{ backgroundColor: '#8000FF' }} />
          <Box flexGrow="1" style={{ backgroundColor: '#FF0080' }} />
        </Flex>
      </Flex>
    </Flex>
  );
}
