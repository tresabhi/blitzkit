import { Flex, TextField } from '@radix-ui/themes';
import { use, useEffect, useRef } from 'react';
import { applyPitchYawLimits } from '../../../../../core/blitz/applyPitchYawLimits';
import { modelDefinitions } from '../../../../../core/blitzkrieg/modelDefinitions';
import { normalizeAnglePI } from '../../../../../core/math/normalizeAngle180';
import mutateTankopedia, {
  useTankopedia,
} from '../../../../../stores/tankopedia';

export function RotationInputs() {
  const model = useTankopedia((state) => state.model);
  const awaitedModelDefinitions = use(modelDefinitions);
  const turretYawInput = useRef<HTMLInputElement>(null);
  const hullYawInput = useRef<HTMLInputElement>(null);
  const gunPitchInput = useRef<HTMLInputElement>(null);
  const protagonist = useTankopedia((state) => {
    if (!state.areTanksAssigned) return;
    return state.protagonist;
  });

  if (!protagonist) return null;

  const tankModelDefinition = awaitedModelDefinitions[protagonist.tank.id];
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];

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
          width: 352,
        }}
      >
        <TextField.Root
          style={{
            flex: 1,
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
          style={{
            flex: 1,
          }}
        >
          <TextField.Slot>Turret</TextField.Slot>
          <TextField.Input
            defaultValue={Math.round(model.turretYaw * (180 / Math.PI))}
            onBlur={() => {
              const [pitch, yaw] = applyPitchYawLimits(
                model.gunPitch,
                -Number(turretYawInput.current?.value) * (Math.PI / 180),
                gunModelDefinition.pitch,
                turretModelDefinition.yaw,
              );
              mutateTankopedia((state) => {
                state.model.gunPitch = pitch;
                state.model.turretYaw = yaw;
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
          <TextField.Slot>Gun</TextField.Slot>
          <TextField.Input
            defaultValue={-Math.round(model.gunPitch * (180 / Math.PI))}
            onBlur={() => {
              const [pitch, yaw] = applyPitchYawLimits(
                -Number(gunPitchInput.current?.value) * (Math.PI / 180),
                model.turretYaw,
                gunModelDefinition.pitch,
                turretModelDefinition.yaw,
              );
              mutateTankopedia((state) => {
                state.model.gunPitch = pitch;
                state.model.turretYaw = yaw;
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
