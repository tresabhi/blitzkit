import { Flex, Heading, Slider, Text, TextField } from '@radix-ui/themes';
import { debounce } from 'lodash';
import { use, useEffect, useRef, useState } from 'react';
import { lerp } from 'three/src/math/MathUtils';
import { isExplosive } from '../../../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../../../core/blitz/resolveNearPenetration';
import { modelDefinitions } from '../../../../../../core/blitzkrieg/modelDefinitions';
import { normalizeBoundingBox } from '../../../../../../core/blitzkrieg/normalizeBoundingBox';
import { resolveDpm } from '../../../../../../core/blitzkrieg/resolveDpm';
import { GUN_TYPE_NAMES } from '../../../../../../core/blitzkrieg/tankDefinitions';
import { unionBoundingBox } from '../../../../../../core/blitzkrieg/unionBoundingBox';
import { useConsumable } from '../../../../../../core/blitzkrieg/useConsumable';
import { useEquipment } from '../../../../../../core/blitzkrieg/useEquipment';
import { useDuel } from '../../../../../../stores/duel';
import { useTankopediaTemporary } from '../../../../../../stores/tankopedia';
import { Info } from './components/Info';
import { InfoWithDelta } from './components/InfoWithDelta';

export function Characteristics() {
  const awaitedModelDefinitions = use(modelDefinitions);
  const { tank, turret, gun, engine, track, shell } = useDuel(
    (state) => state.protagonist!,
  );
  const stockEngine = tank.engines[0];
  const stockTrack = tank.tracks[0];
  const stockTurret = tank.turrets[0];
  const stockGun = stockTurret.guns[0];
  const tankModelDefinition = awaitedModelDefinitions[tank.id];
  const turretModelDefinition = tankModelDefinition.turrets[turret.id];
  const gunModelDefinition = turretModelDefinition.guns[gun.id];
  const size = normalizeBoundingBox(
    unionBoundingBox(
      tankModelDefinition.boundingBox,
      turretModelDefinition.boundingBox,
    ),
  );
  const weight =
    tank.weight + engine.weight + track.weight + turret.weight + gun.weight;
  const weightTons = weight / 1000;
  const stockWeight =
    tank.weight +
    stockEngine.weight +
    stockTrack.weight +
    stockTurret.weight +
    stockGun.weight;
  const [penetrationDistance, setPenetrationDistance] = useState(250);
  const hasRammer = useEquipment(100);
  const hasCalibratedShells = useEquipment(103);
  const hasEnhancedGunLayingDrive = useEquipment(104);
  const hasSupercharger = useEquipment(107);
  const hasVerticalStabilizer = useEquipment(105);
  const hasRefinedGun = useEquipment(106);
  const hasImprovedAssembly = useEquipment(111);
  const hasImprovedOptics = useEquipment(114);
  const hasImprovedControl = useEquipment(116);
  const hasEngineAccelerator = useEquipment(117);
  const hasCamouflageNet = useEquipment(115);
  const hasImprovedVerticalStabilizer = useEquipment(122);
  const hasImprovedSuspension = useEquipment(123);
  const penetrationDistanceInput = useRef<HTMLInputElement>(null);
  const hasEnginePowerBoost = useConsumable(14);
  const hasImprovedEnginePowerBoost = useConsumable(27);
  const hasAdrenaline = useConsumable(18);
  const hasTungsten = useConsumable(45);
  const hasReticleCalibration = useConsumable(28);
  const hasShellReloadBoost = useConsumable(29);
  const camouflage = useTankopediaTemporary((state) => state.camouflage);
  const camouflageBonus = camouflage
    ? tank.type === 'tankDestroyer'
      ? 0.04
      : tank.type === 'heavy'
        ? 0.03
        : 0.02
    : 0;
  const shellReloadBoostBonus = hasShellReloadBoost ? 0.7 : 1;
  const adrenalineBonus = hasAdrenaline && gun.type === 'regular' ? 0.8 : 1;
  const enginePowerBoostBonus =
    (hasEnginePowerBoost ? 1.2 : 1) * (hasImprovedEnginePowerBoost ? 1.4 : 1);
  const camouflageNetBonus = hasCamouflageNet
    ? tank.type === 'heavy'
      ? 0.03
      : tank.type === 'tankDestroyer'
        ? 0.07
        : 0.05
    : 0;
  const calibratedShellsBonus = hasCalibratedShells
    ? isExplosive(shell.type)
      ? 1.1
      : 1.05
    : 1;
  const engineAcceleratorBonus = hasEngineAccelerator
    ? tank.type === 'light' || tank.type === 'medium'
      ? 1.05
      : 1.07
    : 1;
  const resolvedEnginePower =
    engine.power * engineAcceleratorBonus * enginePowerBoostBonus;
  const reticleCalibrationBonus = hasReticleCalibration ? 0.6 : 1;
  const improvedEnginePowerBoostTraverseBonus = hasImprovedEnginePowerBoost
    ? 1.05
    : 1;

  useEffect(() => {
    if (penetrationDistanceInput.current) {
      penetrationDistanceInput.current.value = `${penetrationDistance}`;
    }
  }, [penetrationDistance]);

  return (
    <Flex direction="column" gap="4" style={{ width: '100%' }}>
      <Flex direction="column" gap="2">
        <Heading size="5">Fire</Heading>
        <Info name="Gun type">{GUN_TYPE_NAMES[gun.type]}</Info>
        <InfoWithDelta name="DPM" decimals={0} unit="hp / min">
          {resolveDpm(gun, shell, hasRammer, hasShellReloadBoost)}
        </InfoWithDelta>
        {gun.type === 'autoReloader' && (
          <>
            <InfoWithDelta decimals={0} indent name="Maximum" unit="hp / min">
              {gun.reload.at(-1)! < gun.reload.at(-2)!
                ? (shell.damage.armor / (gun.reload.at(-1)! + gun.interClip)) *
                  60
                : (shell.damage.armor / gun.reload[0]) * 60}
            </InfoWithDelta>
            <InfoWithDelta
              decimals={0}
              indent
              name="Effective at 60s"
              unit="hp / min"
            >
              {gun.reload.at(-1)! < gun.reload.at(-2)!
                ? (shell.damage.armor / (gun.reload.at(-1)! + gun.interClip)) *
                    (60 -
                      (gun.reload.slice(0, -1).length - 1) * gun.interClip) +
                  shell.damage.armor * gun.reload.slice(0, -1).length
                : (shell.damage.armor / (gun.reload[0] + gun.interClip)) *
                    (60 - (gun.reload.slice(1).length - 1) * gun.interClip) +
                  shell.damage.armor * gun.reload.slice(1).length}
            </InfoWithDelta>
            <Info
              indent
              name={
                <a
                  target="_blank"
                  href="https://tresabhi.github.io/blitzkrieg/guide/dpm.html"
                >
                  What's the difference?
                </a>
              }
            />
            <Info indent name="Optimal shell index">
              {gun.reload.at(-1)! < gun.reload.at(-2)! ? gun.reload.length : 1}
            </Info>
          </>
        )}
        {gun.type === 'autoReloader' ? (
          <>
            <Info name="Reload" unit="s" />
            {gun.reload.map((reload, index) => (
              <InfoWithDelta
                key={index}
                indent
                name={`Shell ${index + 1}`}
                decimals={2}
                deltaType="lowerIsBetter"
              >
                {reload}
              </InfoWithDelta>
            ))}
          </>
        ) : (
          <InfoWithDelta
            decimals={2}
            name="Reload"
            unit="s"
            deltaType="lowerIsBetter"
          >
            {gun.reload * (hasRammer ? 0.93 : 1) * adrenalineBonus}
          </InfoWithDelta>
        )}
        {gun.type === 'autoLoader' && (
          <InfoWithDelta
            indent
            decimals={2}
            name="Inter-clip reload"
            unit="s"
            deltaType="lowerIsBetter"
          >
            {gun.interClip * shellReloadBoostBonus}
          </InfoWithDelta>
        )}
        <InfoWithDelta name="Caliber" decimals={0} unit="mm">
          {shell.caliber}
        </InfoWithDelta>
        <InfoWithDelta decimals={0} name="Penetration" unit="mm">
          {resolveNearPenetration(shell.penetration) * calibratedShellsBonus}
        </InfoWithDelta>
        {typeof shell.penetration !== 'number' && (
          <>
            <Info
              delta={
                (lerp(
                  shell.penetration[0],
                  shell.penetration[1],
                  penetrationDistance / 500,
                ) -
                  shell.penetration[0]) *
                calibratedShellsBonus
              }
              indent
              decimals={0}
              name={`At ${penetrationDistance}m`}
            >
              {lerp(
                shell.penetration[0],
                shell.penetration[1],
                penetrationDistance / 500,
              ) * calibratedShellsBonus}
            </Info>
            <Flex align="center" gap="2" style={{ paddingLeft: 24 }}>
              <Text>Distance</Text>
              <Slider
                key={penetrationDistance}
                min={0}
                max={500}
                style={{ flex: 1 }}
                defaultValue={[penetrationDistance]}
                onValueChange={debounce(([value]) => {
                  setPenetrationDistance(value);
                }, 500)}
              />
              <TextField.Root style={{ width: 64 }}>
                <TextField.Input
                  ref={penetrationDistanceInput}
                  defaultValue={penetrationDistance}
                  onBlur={() => {
                    setPenetrationDistance(
                      Math.min(
                        parseInt(penetrationDistanceInput.current!.value),
                        500,
                      ),
                    );
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.currentTarget.blur();
                    }
                  }}
                />
                <TextField.Slot>m</TextField.Slot>
              </TextField.Root>
            </Flex>
          </>
        )}
        <InfoWithDelta name="Damage" unit="hp" decimals={0}>
          {shell.damage.armor * (hasTungsten ? 1.15 : 1)}
        </InfoWithDelta>
        <InfoWithDelta name="Module damage" unit="hp">
          {shell.damage.module}
        </InfoWithDelta>
        <InfoWithDelta name="Shell velocity" unit="m/s">
          {shell.speed * (hasSupercharger ? 1.3 : 1)}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={2}
          name="Aim time"
          unit="s"
          deltaType="lowerIsBetter"
        >
          {gun.aimTime *
            (hasEnhancedGunLayingDrive ? 0.9 : 1) *
            reticleCalibrationBonus}
        </InfoWithDelta>
        <Info name="Dispersion at 100m" />
        <InfoWithDelta
          decimals={3}
          indent
          name="Still"
          unit="m"
          deltaType="lowerIsBetter"
        >
          {gun.dispersion.base *
            (hasRefinedGun ? 0.9 : 1) *
            reticleCalibrationBonus}
        </InfoWithDelta>
        <InfoWithDelta
          prefix="+ "
          decimals={3}
          indent
          name="Moving"
          unit="s"
          deltaType="lowerIsBetter"
        >
          {track.dispersion.move *
            (hasVerticalStabilizer ? 0.85 : 1) *
            reticleCalibrationBonus}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={3}
          prefix="+ "
          indent
          name="Hull traversing"
          unit="°"
          deltaType="lowerIsBetter"
        >
          {track.dispersion.traverse *
            (hasVerticalStabilizer ? 0.85 : 1) *
            reticleCalibrationBonus}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={3}
          prefix="+ "
          indent
          name="Turret traversing"
          unit="°"
          deltaType="lowerIsBetter"
        >
          {gun.dispersion.traverse *
            (hasVerticalStabilizer ? 0.85 : 1) *
            reticleCalibrationBonus}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={3}
          prefix="+ "
          indent
          name="After shooting"
          unit="m"
          deltaType="lowerIsBetter"
        >
          {gun.dispersion.shot * reticleCalibrationBonus}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={3}
          prefix="x "
          indent
          name="Gun damaged"
          unit="scalar"
          deltaType="lowerIsBetter"
        >
          {gun.dispersion.damaged * reticleCalibrationBonus}
        </InfoWithDelta>
        <Info name="Gun flexibility" unit="°" />
        <InfoWithDelta decimals={1} indent name="Depression">
          {gunModelDefinition.pitch.max +
            (hasImprovedVerticalStabilizer ? 3 : 0)}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="Elevation">
          {-gunModelDefinition.pitch.min +
            (hasImprovedVerticalStabilizer ? 3 : 0)}
        </InfoWithDelta>
        {gunModelDefinition.pitch.front && (
          <>
            <InfoWithDelta decimals={1} indent name="Frontal depression">
              {gunModelDefinition.pitch.front.max}
            </InfoWithDelta>
            <InfoWithDelta decimals={1} indent name="Frontal elevation">
              {-gunModelDefinition.pitch.front.min}
            </InfoWithDelta>
          </>
        )}
        {gunModelDefinition.pitch.back && (
          <>
            <InfoWithDelta decimals={1} indent name="Rear depression">
              {gunModelDefinition.pitch.back.max}
            </InfoWithDelta>
            <InfoWithDelta decimals={1} indent name="Rear elevation">
              {-gunModelDefinition.pitch.back.min}
            </InfoWithDelta>
          </>
        )}
        {turretModelDefinition.yaw && (
          <>
            <InfoWithDelta decimals={1} indent name="Azimuth left">
              {-turretModelDefinition.yaw.min}
            </InfoWithDelta>
            <InfoWithDelta decimals={1} indent name="Azimuth right">
              {turretModelDefinition.yaw.max}
            </InfoWithDelta>
          </>
        )}
      </Flex>

      <Flex direction="column" gap="2">
        <Heading size="5">Maneuverability</Heading>
        <Info name="Speed" unit="km/hr" />
        <InfoWithDelta decimals={0} indent name="Forwards">
          {tank.speed.forwards + (hasImprovedEnginePowerBoost ? 5 : 0)}
        </InfoWithDelta>
        <InfoWithDelta decimals={0} indent name="Backwards">
          {tank.speed.backwards + (hasImprovedEnginePowerBoost ? 10 : 0)}
        </InfoWithDelta>
        <InfoWithDelta decimals={0} name="Power" unit="hp">
          {resolvedEnginePower}
        </InfoWithDelta>
        <Info name="Power to weight ratio" unit="hp/tn" />
        <InfoWithDelta decimals={1} indent name="On hard terrain">
          {resolvedEnginePower /
            weightTons /
            (track.resistance.hard * (hasImprovedSuspension ? 0.75 : 1))}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="On medium terrain">
          {(resolvedEnginePower /
            weightTons /
            (track.resistance.medium * (hasImprovedSuspension ? 0.75 : 1))) *
            engineAcceleratorBonus}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="On soft terrain">
          {(resolvedEnginePower /
            weightTons /
            (track.resistance.soft * (hasImprovedSuspension ? 0.75 : 1))) *
            engineAcceleratorBonus}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={1}
          name="Weight"
          unit="tn"
          deltaType="lowerIsBetter"
        >
          {weightTons}
        </InfoWithDelta>
        <Info name="Effective traverse speed" unit="°/s" />
        <InfoWithDelta decimals={1} indent name="On hard terrain">
          {(resolvedEnginePower / stockEngine.power) *
            track.traverseSpeed *
            (track.resistance.hard / track.resistance.hard) *
            (stockWeight / weight) *
            (hasImprovedControl ? 1.1 : 1) *
            improvedEnginePowerBoostTraverseBonus}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="On medium terrain">
          {(resolvedEnginePower / stockEngine.power) *
            track.traverseSpeed *
            (track.resistance.hard / track.resistance.medium) *
            (stockWeight / weight) *
            (hasImprovedControl ? 1.1 : 1) *
            improvedEnginePowerBoostTraverseBonus}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="On soft terrain">
          {(resolvedEnginePower / stockEngine.power) *
            track.traverseSpeed *
            (track.resistance.hard / track.resistance.soft) *
            (stockWeight / weight) *
            (hasImprovedControl ? 1.1 : 1) *
            improvedEnginePowerBoostTraverseBonus}
        </InfoWithDelta>
      </Flex>

      <Flex direction="column" gap="2">
        <Heading size="5">Survivability</Heading>
        <InfoWithDelta name="Health" unit="hp">
          {(tank.health + turret.health) * (hasImprovedAssembly ? 1.06 : 1)}
        </InfoWithDelta>
        <InfoWithDelta name="Fire chance" unit="%" deltaType="lowerIsBetter">
          {Math.round(engine.fireChance * 100)}
        </InfoWithDelta>
        <InfoWithDelta name="View range" unit="m">
          {turret.viewRange *
            (hasImprovedOptics
              ? tank.type === 'tankDestroyer'
                ? 1.05
                : tank.type === 'heavy'
                  ? 1.07
                  : 1.1
              : 1)}
        </InfoWithDelta>
        <Info name="Camouflage" unit="%" />
        <InfoWithDelta indent name="Still" decimals={2}>
          {(tank.camouflage.still + camouflageNetBonus + camouflageBonus) * 100}
        </InfoWithDelta>
        <InfoWithDelta indent name="Moving" decimals={2}>
          {(tank.camouflage.moving + camouflageNetBonus + camouflageBonus) *
            100}
        </InfoWithDelta>
        <InfoWithDelta indent name="Shooting still" decimals={2}>
          {(tank.camouflage.still + camouflageNetBonus + camouflageBonus) *
            gun.camouflageLoss *
            100}
        </InfoWithDelta>
        <InfoWithDelta indent name="Shooting on move" decimals={2}>
          {(tank.camouflage.moving + camouflageNetBonus + camouflageBonus) *
            gun.camouflageLoss *
            100}
        </InfoWithDelta>
        <InfoWithDelta indent name="On fire" decimals={2}>
          {(tank.camouflage.onFire + camouflageNetBonus + camouflageBonus) *
            tank.camouflage.still *
            100}
        </InfoWithDelta>
        <Info name="Size" unit="m">
          {size[0].toFixed(2)} x {size[2].toFixed(2)} x {size[1].toFixed(2)}
        </Info>
      </Flex>
    </Flex>
  );
}
