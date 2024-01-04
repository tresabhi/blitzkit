import { Flex, TextField } from '@radix-ui/themes';
import { clamp } from 'lodash';
import { use, useEffect, useRef } from 'react';
import { modelDefinitions } from '../../../../../core/blitzkrieg/modelDefinitions';
import { normalizeAnglePI } from '../../../../../core/math/normalizeAngle180';
import mutateTankopedia, {
  useTankopedia,
} from '../../../../../stores/tankopedia';

interface RotationInputsProps {
  tankId: number;
  gunId: number;
  turretId: number;
}

export function RotationInputs({
  tankId,
  gunId,
  turretId,
}: RotationInputsProps) {
  const model = useTankopedia((state) => state.model);
  const awaitedModelDefinitions = use(modelDefinitions);
  const turretYawInput = useRef<HTMLInputElement>(null);
  const hullYawInput = useRef<HTMLInputElement>(null);
  const gunPitchInput = useRef<HTMLInputElement>(null);

  const tankModelDefinition = awaitedModelDefinitions[tankId];
  const turretModelDefinition = tankModelDefinition.turrets[turretId];
  const gunModelDefinition = turretModelDefinition.guns[gunId];

  useEffect(() => {
    hullYawInput.current!.value = `${-Math.round(
      model.hullYaw * (180 / Math.PI),
    )}`;
  }, [model.hullYaw]);
  useEffect(() => {
    turretYawInput.current!.value = `${-Math.round(
      model.turretYaw * (180 / Math.PI),
    )}`;
  }, [model.turretYaw]);
  useEffect(() => {
    gunPitchInput.current!.value = `${-Math.round(
      model.gunPitch * (180 / Math.PI),
    )}`;
  }, [model.gunPitch]);

  return (
    <Flex
      gap="2"
      align="center"
      style={{
        position: 'absolute',
        left: 16,
        bottom: 16,
      }}
    >
      <TextField.Root
        variant="surface"
        style={{
          width: 115,
        }}
      >
        <TextField.Slot>Hull</TextField.Slot>
        <TextField.Input
          defaultValue={Math.round(model.hullYaw * (180 / Math.PI))}
          onBlur={() => {
            const normalized = normalizeAnglePI(
              -Number(hullYawInput.current?.value) * (Math.PI / 180),
            );
            mutateTankopedia((state) => {
              state.model.hullYaw = normalized;
            });
            hullYawInput.current!.value = `${Math.round(normalized)}`;
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              hullYawInput.current?.blur();
            }
          }}
          onFocus={() => hullYawInput.current?.focus()}
          ref={hullYawInput}
          style={{ textAlign: 'right' }}
        />
        <TextField.Slot>°</TextField.Slot>
      </TextField.Root>

      <TextField.Root
        variant="surface"
        style={{
          width: 115,
        }}
      >
        <TextField.Slot>Turret</TextField.Slot>
        <TextField.Input
          defaultValue={Math.round(model.turretYaw * (180 / Math.PI))}
          onBlur={() => {
            const normalized = normalizeAnglePI(
              -Number(turretYawInput.current?.value) * (Math.PI / 180),
            );
            mutateTankopedia((state) => {
              state.model.turretYaw = normalized;
            });
            turretYawInput.current!.value = `${Math.round(normalized)}`;
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
        variant="surface"
        style={{
          width: 115,
        }}
      >
        <TextField.Slot>Gun</TextField.Slot>
        <TextField.Input
          defaultValue={-Math.round(model.gunPitch * (180 / Math.PI))}
          onBlur={() => {
            const clamped = clamp(
              Number(gunPitchInput.current?.value),
              gunModelDefinition.pitch.min,
              gunModelDefinition.pitch.max,
            );
            mutateTankopedia((state) => {
              state.model.gunPitch = -clamped * (Math.PI / 180);
            });
            gunPitchInput.current!.value = `${Math.round(clamped)}`;
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
  );
}
