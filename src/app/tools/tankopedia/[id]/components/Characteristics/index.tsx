import { AccessibilityIcon } from '@radix-ui/react-icons';
import { Flex, Heading, Slider, Text, TextField } from '@radix-ui/themes';
import { debounce } from 'lodash';
import { use, useEffect, useRef, useState } from 'react';
import { lerp } from 'three/src/math/MathUtils';
import { ShellButton } from '../../../../../../components/ModuleButtons/ShellButton';
import { applyPitchYawLimits } from '../../../../../../core/blitz/applyPitchYawLimits';
import { isExplosive } from '../../../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../../../core/blitz/resolveNearPenetration';
import { coefficient } from '../../../../../../core/blitzkrieg/coefficient';
import { degressiveStat } from '../../../../../../core/blitzkrieg/degressiveStat';
import { modelDefinitions } from '../../../../../../core/blitzkrieg/modelDefinitions';
import { normalizeBoundingBox } from '../../../../../../core/blitzkrieg/normalizeBoundingBox';
import { progressiveStat } from '../../../../../../core/blitzkrieg/progressiveStat';
import { resolveDpm } from '../../../../../../core/blitzkrieg/resolveDpm';
import { sum } from '../../../../../../core/blitzkrieg/sum';
import {
  CREW_MEMBER_NAMES,
  GUN_TYPE_NAMES,
  SHELL_NAMES,
} from '../../../../../../core/blitzkrieg/tankDefinitions/constants';
import { unionBoundingBox } from '../../../../../../core/blitzkrieg/unionBoundingBox';
import { useConsumable } from '../../../../../../hooks/useConsumable';
import { useEquipment } from '../../../../../../hooks/useEquipment';
import { useProvision } from '../../../../../../hooks/useProvision';
import { useProvisions } from '../../../../../../hooks/useProvisions';
import { mutateDuel, useDuel } from '../../../../../../stores/duel';
import { Info } from './components/Info';
import { InfoWithDelta } from './components/InfoWithDelta';

export function Characteristics() {
  const awaitedModelDefinitions = use(modelDefinitions);
  const { tank, turret, gun, engine, track, shell } = useDuel(
    (state) => state.protagonist!,
  );
  const hasImprovedVentilation = useEquipment(102);
  const provisions = useProvisions();
  const crewMastery = useDuel((state) => state.protagonist!.crewMastery);
  const provisionCrewBonus =
    provisions.reduce(
      (total, provision) =>
        provision.crew ? total + provision.crew / 100 : total,
      0,
    ) + (hasImprovedVentilation ? 0.05 : 0);
  const commanderMastery = crewMastery + provisionCrewBonus;
  const crewMemberMastery = commanderMastery * 1.1;
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
  const gunDefaultPitch = tankModelDefinition.turretRotation?.pitch ?? 0;
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
  const camouflage = useDuel((state) => state.protagonist!.camouflage);
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
  const hasStandardFuel = useProvision(18);
  const hasImprovedFuel = useProvision(19);
  const hasProtectiveKit = useProvision(22);
  const hasSandbagArmor = useProvision(28);
  const hasEnhancedSandbagArmor = useProvision(29);
  const hasImprovedGunPowder = useProvision(46);
  const hasGearOil = useProvision(44);
  const hasImprovedGearOil = useProvision(45);

  const healthCoefficient = coefficient(
    [hasSandbagArmor, 0.03],
    [hasEnhancedSandbagArmor, 0.06],
    [hasImprovedAssembly, 0.06],
  );
  const reloadCoefficient =
    (coefficient([hasRammer, -0.07]) *
      coefficient([true, degressiveStat(crewMemberMastery)])) /
    coefficient([hasAdrenaline && gun.type === 'regular', 0.2]);
  const penetrationCoefficient = coefficient([
    hasCalibratedShells,
    isExplosive(shell.type) ? 0.1 : 0.05,
  ]);
  const damageCoefficient = coefficient(
    // TODO: add max rolls
    [hasTungsten, 0.15],
  );
  const intraClipCoefficient = coefficient([hasShellReloadBoost, -0.3]);
  const shellVelocityCoefficient = coefficient(
    [hasSupercharger, 0.3],
    [hasImprovedGunPowder, 0.3],
  );
  const penetrationLossOverDistanceCoefficient = coefficient([
    hasSupercharger,
    -0.5,
  ]);
  const aimTimeCoefficient =
    coefficient(
      [hasEnhancedGunLayingDrive, -0.1],
      [hasReticleCalibration, -0.4],
    ) * coefficient([true, degressiveStat(crewMemberMastery)]);
  const dispersionStillCoefficient =
    coefficient([hasRefinedGun, -0.1], [hasReticleCalibration, -0.4]) *
    coefficient([true, degressiveStat(crewMemberMastery)]);
  const dispersionMovingCoefficient = coefficient([
    hasVerticalStabilizer,
    -0.15,
  ]);
  const enginePowerCoefficient = coefficient(
    [
      hasEngineAccelerator &&
        (tank.class === 'lightTank' || tank.class === 'mediumTank'),
      0.05,
    ],
    [
      hasEngineAccelerator &&
        (tank.class === 'heavyTank' || tank.class === 'AT-SPG'),
      0.07,
    ],
    [hasEnginePowerBoost, 0.2],
    [hasImprovedEnginePowerBoost, 0.4],
    [hasStandardFuel, 0.03],
    [hasImprovedFuel, 0.1],
    [hasGearOil, 0.03],
    [hasImprovedGearOil, 0.06],
  );
  const turretTraverseCoefficient =
    coefficient([hasStandardFuel, 0.03], [hasImprovedFuel, 0.1]) *
    coefficient([true, progressiveStat(crewMemberMastery)]);
  const hullTraverseCoefficient =
    coefficient(
      [hasImprovedControl, 0.1],
      [hasImprovedEnginePowerBoost, 0.05],
    ) * coefficient([true, progressiveStat(crewMemberMastery)]);
  const resistanceCoefficient = coefficient([hasImprovedSuspension, -0.25]);
  const viewRangeCoefficient =
    coefficient([
      hasImprovedOptics,
      tank.class === 'AT-SPG' ? 0.05 : tank.class === 'heavyTank' ? 0.07 : 0.1,
    ]) * coefficient([true, progressiveStat(commanderMastery)]);
  const fireChanceCoefficient = coefficient([hasProtectiveKit, -0.2]);

  const speedForwardsSum = sum(
    [hasImprovedEnginePowerBoost, 5],
    [hasGearOil, 2],
    [hasImprovedGearOil, 4],
  );
  const speedBackwardsSum = sum(
    [hasImprovedEnginePowerBoost, 10],
    [hasGearOil, 2],
    [hasImprovedGearOil, 4],
  );
  const camouflageSumMoving = sum(
    [
      hasCamouflageNet,
      tank.class === 'heavyTank' ? 0.03 : tank.class === 'AT-SPG' ? 0.07 : 0.05,
    ],
    [
      camouflage,
      tank.class === 'AT-SPG' ? 0.04 : tank.class === 'heavyTank' ? 0.03 : 0.02,
    ],
  );
  const camouflageSumStill = sum(
    [
      hasCamouflageNet,
      2 *
        (tank.class === 'heavyTank'
          ? 0.03
          : tank.class === 'AT-SPG'
            ? 0.07
            : 0.05),
    ],
    [
      camouflage,
      tank.class === 'AT-SPG' ? 0.04 : tank.class === 'heavyTank' ? 0.03 : 0.02,
    ],
  );

  const resolvedEnginePower = engine.power * enginePowerCoefficient;
  const dpm = resolveDpm(
    gun,
    shell,
    damageCoefficient,
    reloadCoefficient,
    intraClipCoefficient,
  );

  useEffect(() => {
    if (penetrationDistanceInput.current) {
      penetrationDistanceInput.current.value = `${penetrationDistance}`;
    }
  }, [penetrationDistance]);
  useEffect(() => {
    mutateDuel((draft) => {
      [draft.protagonist!.pitch, draft.protagonist!.yaw] = applyPitchYawLimits(
        draft.protagonist!.pitch,
        draft.protagonist!.yaw,
        gunModelDefinition.pitch,
        turretModelDefinition.yaw,
        hasImprovedVerticalStabilizer,
      );
    });
  }, [hasImprovedVerticalStabilizer]);

  return (
    <Flex direction="column" gap="8" style={{ width: '100%' }}>
      <Flex direction="column" gap="2">
        <Flex align="center" gap="4">
          <Heading size="5">Fire</Heading>

          <Flex>
            {gun.shells.map((thisShell, index) => {
              return (
                <ShellButton
                  key={thisShell.id}
                  shell={thisShell.icon}
                  discriminator={SHELL_NAMES[thisShell.type]}
                  selected={thisShell.id === shell.id}
                  first={index === 0}
                  last={index === gun.shells.length - 1}
                  rowChild
                  onClick={() => {
                    mutateDuel((draft) => {
                      draft.protagonist!.shell = thisShell;
                    });
                  }}
                />
              );
            })}
          </Flex>
        </Flex>

        <Info name="Gun type">{GUN_TYPE_NAMES[gun.type]}</Info>
        <InfoWithDelta name="DPM" decimals={0} unit="hp / min">
          {dpm}
        </InfoWithDelta>
        {gun.type === 'autoReloader' && (
          <>
            <InfoWithDelta decimals={0} indent name="Maximum" unit="hp / min">
              {gun.reload.at(-1)! < gun.reload.at(-2)!
                ? (shell.damage.armor / (gun.reload.at(-1)! + gun.intraClip)) *
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
                ? (shell.damage.armor / (gun.reload.at(-1)! + gun.intraClip)) *
                    (60 -
                      (gun.reload.slice(0, -1).length - 1) * gun.intraClip) +
                  shell.damage.armor * gun.reload.slice(0, -1).length
                : (shell.damage.armor / (gun.reload[0] + gun.intraClip)) *
                    (60 - (gun.reload.slice(1).length - 1) * gun.intraClip) +
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
          </>
        )}
        {gun.type === 'autoReloader' ? (
          <>
            <InfoWithDelta name="Shells">{gun.reload.length}</InfoWithDelta>
            <Info indent name="Most optimal">
              {gun.reload.at(-1)! < gun.reload.at(-2)! ? gun.reload.length : 1}
            </Info>
            <Info name="Shell reloads" unit="s" />
            {gun.reload.map((reload, index) => (
              <InfoWithDelta
                key={index}
                indent
                name={`Shell ${index + 1}`}
                decimals={2}
                deltaType="lowerIsBetter"
              >
                {reload * reloadCoefficient}
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
            {gun.reload * reloadCoefficient}
          </InfoWithDelta>
        )}
        {gun.type === 'autoLoader' ||
          (gun.type === 'autoReloader' && (
            <InfoWithDelta
              indent
              decimals={2}
              name="Intra-clip"
              unit="s"
              deltaType="lowerIsBetter"
            >
              {gun.intraClip * intraClipCoefficient}
            </InfoWithDelta>
          ))}
        <InfoWithDelta name="Caliber" decimals={0} unit="mm">
          {shell.caliber}
        </InfoWithDelta>
        <InfoWithDelta decimals={0} name="Penetration" unit="mm">
          {resolveNearPenetration(shell.penetration) * penetrationCoefficient}
        </InfoWithDelta>
        {typeof shell.penetration !== 'number' && (
          <>
            <InfoWithDelta
              indent
              decimals={0}
              name={`At ${penetrationDistance}m`}
            >
              {lerp(
                shell.penetration[0],
                shell.penetration[1],
                (penetrationDistance * penetrationLossOverDistanceCoefficient) /
                  500,
              ) * penetrationCoefficient}
            </InfoWithDelta>
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
          {shell.damage.armor * damageCoefficient}
        </InfoWithDelta>
        <InfoWithDelta name="Module damage" unit="hp" decimals={0}>
          {shell.damage.module * damageCoefficient}
        </InfoWithDelta>
        <InfoWithDelta name="Shell velocity" unit="m/s" decimals={0}>
          {shell.speed * shellVelocityCoefficient}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={2}
          name="Aim time"
          unit="s"
          deltaType="lowerIsBetter"
        >
          {gun.aimTime * aimTimeCoefficient}
        </InfoWithDelta>
        <Info name="Dispersion at 100m" />
        <InfoWithDelta
          decimals={3}
          indent
          name="Still"
          unit="m"
          deltaType="lowerIsBetter"
        >
          {gun.dispersion.base * dispersionStillCoefficient}
        </InfoWithDelta>
        <InfoWithDelta
          prefix="+ "
          decimals={3}
          indent
          name="Moving"
          deltaType="lowerIsBetter"
        >
          {track.dispersion.move * dispersionMovingCoefficient}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={3}
          prefix="+ "
          indent
          name="Hull traversing"
          deltaType="lowerIsBetter"
        >
          {track.dispersion.traverse * dispersionMovingCoefficient}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={3}
          prefix="+ "
          indent
          name="Turret traversing"
          deltaType="lowerIsBetter"
        >
          {gun.dispersion.traverse * dispersionMovingCoefficient}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={3}
          prefix="+ "
          indent
          name="After shooting"
          deltaType="lowerIsBetter"
        >
          {gun.dispersion.shot * dispersionMovingCoefficient}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={1}
          prefix="x "
          indent
          name="Gun damaged"
          unit="scalar"
          deltaType="lowerIsBetter"
        >
          {gun.dispersion.damaged * dispersionMovingCoefficient}
        </InfoWithDelta>
        <Info name="Gun flexibility" unit="°" />
        <InfoWithDelta decimals={1} indent name="Depression">
          {gunModelDefinition.pitch.max +
            gunDefaultPitch +
            (hasImprovedVerticalStabilizer ? 3 : 0)}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="Elevation">
          {-gunModelDefinition.pitch.min -
            gunDefaultPitch +
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
          {tank.speed.forwards + speedForwardsSum}
        </InfoWithDelta>
        <InfoWithDelta decimals={0} indent name="Backwards">
          {tank.speed.backwards + speedBackwardsSum}
        </InfoWithDelta>
        <InfoWithDelta decimals={0} name="Power" unit="hp">
          {resolvedEnginePower}
        </InfoWithDelta>
        <Info name="Power to weight ratio" unit="hp/tn" />
        <InfoWithDelta decimals={1} indent name="On hard terrain">
          {resolvedEnginePower /
            weightTons /
            (track.resistance.hard * resistanceCoefficient)}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="On medium terrain">
          {resolvedEnginePower /
            weightTons /
            (track.resistance.medium * resistanceCoefficient)}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="On soft terrain">
          {resolvedEnginePower /
            weightTons /
            (track.resistance.soft * resistanceCoefficient)}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={1}
          name="Weight"
          unit="tn"
          deltaType="lowerIsBetter"
        >
          {weightTons}
        </InfoWithDelta>
        <InfoWithDelta name="Turret traverse speed" unit="°/s" decimals={0}>
          {turret.traverseSpeed * turretTraverseCoefficient}
        </InfoWithDelta>
        <Info name="Effective traverse speed" unit="°/s" />
        <InfoWithDelta decimals={1} indent name="On hard terrain">
          {(resolvedEnginePower / stockEngine.power) *
            track.traverseSpeed *
            hullTraverseCoefficient *
            (track.resistance.hard /
              (track.resistance.hard * resistanceCoefficient)) *
            (stockWeight / weight)}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="On medium terrain">
          {(resolvedEnginePower / stockEngine.power) *
            track.traverseSpeed *
            hullTraverseCoefficient *
            (track.resistance.hard /
              (track.resistance.medium * resistanceCoefficient)) *
            (stockWeight / weight)}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="On soft terrain">
          {(resolvedEnginePower / stockEngine.power) *
            track.traverseSpeed *
            hullTraverseCoefficient *
            (track.resistance.hard /
              (track.resistance.soft * resistanceCoefficient)) *
            (stockWeight / weight)}
        </InfoWithDelta>
      </Flex>

      <Flex direction="column" gap="2">
        <Heading size="5">Survivability</Heading>
        <InfoWithDelta name="Health" unit="hp" decimals={0}>
          {(tank.health + turret.health) * healthCoefficient}
        </InfoWithDelta>
        <InfoWithDelta name="Fire chance" unit="%" deltaType="lowerIsBetter">
          {Math.round(engine.fireChance * fireChanceCoefficient * 100)}
        </InfoWithDelta>
        <InfoWithDelta name="View range" unit="m" decimals={0}>
          {turret.viewRange * viewRangeCoefficient}
        </InfoWithDelta>
        <Info name="Camouflage" unit="%" />
        <InfoWithDelta indent name="Still" decimals={2}>
          {(tank.camouflage.still + camouflageSumStill) * 100}
        </InfoWithDelta>
        <InfoWithDelta indent name="Moving" decimals={2}>
          {(tank.camouflage.moving + camouflageSumMoving) * 100}
        </InfoWithDelta>
        <InfoWithDelta indent name="Shooting still" decimals={2}>
          {(tank.camouflage.still * gun.camouflageLoss + camouflageSumStill) *
            100}
        </InfoWithDelta>
        <InfoWithDelta indent name="Shooting on move" decimals={2}>
          {(tank.camouflage.moving * gun.camouflageLoss + camouflageSumMoving) *
            100}
        </InfoWithDelta>
        <InfoWithDelta indent name="Caught on fire" decimals={2}>
          {(tank.camouflage.onFire * tank.camouflage.still +
            camouflageSumStill) *
            100}
        </InfoWithDelta>
        <Info name="Size" unit="m">
          {size[0].toFixed(2)} x {size[2].toFixed(2)} x {size[1].toFixed(2)}
        </Info>
      </Flex>

      <Flex direction="column" gap="2">
        <Heading size="5">Crew training</Heading>

        {tank.crew.map((member) => {
          const count = member.count ?? 1;

          return (
            <>
              <InfoWithDelta
                key={`${member.type}-root`}
                name={`${CREW_MEMBER_NAMES[member.type]}${count > 1 ? ` x ${count}` : ''}`}
                unit="%"
                decimals={0}
              >
                {(member.type === 'commander'
                  ? commanderMastery
                  : crewMemberMastery) * 100}
              </InfoWithDelta>
              {member.substitute && (
                <Info
                  key={`${member.type}-substitute`}
                  indent
                  name={
                    <>
                      <Flex align="center" gap="1">
                        <AccessibilityIcon />
                        {member.substitute
                          .map((sub, index) =>
                            index === 0 ? CREW_MEMBER_NAMES[sub] : sub,
                          )
                          .join(', ')}
                      </Flex>
                    </>
                  }
                />
              )}
            </>
          );
        })}
      </Flex>
    </Flex>
  );
}
