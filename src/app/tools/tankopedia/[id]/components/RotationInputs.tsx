import { Flex, TextField } from '@radix-ui/themes';
import { use, useEffect, useRef } from 'react';
import { applyPitchYawLimits } from '../../../../../core/blitz/applyPitchYawLimits';
import { modelDefinitions } from '../../../../../core/blitzkrieg/modelDefinitions';
import { modelTransformEvent } from '../../../../../core/blitzkrieg/modelTransform';
import mutateTankopedia, {
  useTankopedia,
} from '../../../../../stores/tankopedia';
import { Duel } from '../page';

interface RotationInputsProps {
  duel: Duel;
}

export function RotationInputs({ duel: { protagonist } }: RotationInputsProps) {
  const physical = useTankopedia((state) => state.model.physical);
  const awaitedModelDefinitions = use(modelDefinitions);
  const turretYawInput = useRef<HTMLInputElement>(null);
  const gunPitchInput = useRef<HTMLInputElement>(null);

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
          <TextField.Slot>Yaw</TextField.Slot>
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
              mutateTankopedia((state) => {
                state.model.physical.pitch = pitch;
                state.model.physical.yaw = yaw;
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
          <TextField.Slot>°</TextField.Slot>
        </TextField.Root>

        <TextField.Root
          style={{
            flex: 1,
          }}
        >
          <TextField.Slot>Pitch</TextField.Slot>
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
              mutateTankopedia((state) => {
                state.model.physical.pitch = pitch;
                state.model.physical.yaw = yaw;
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
          <TextField.Slot>°</TextField.Slot>
        </TextField.Root>
      </Flex>
    </Flex>
  );
}
