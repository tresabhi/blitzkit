import { AccessibilityIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import {
  Flex,
  Heading,
  IconButton,
  Popover,
  Slider,
  Text,
  TextField,
} from '@radix-ui/themes';
import { debounce } from 'lodash';
import { Fragment, use, useEffect, useRef, useState } from 'react';
import { lerp } from 'three/src/math/MathUtils';
import { ShellButton } from '../../../../../../components/ModuleButtons/ShellButton';
import { applyPitchYawLimits } from '../../../../../../core/blitz/applyPitchYawLimits';
import { isExplosive } from '../../../../../../core/blitz/isExplosive';
import { coefficient } from '../../../../../../core/blitzkrieg/coefficient';
import { equipmentDefinitions } from '../../../../../../core/blitzkrieg/equipmentDefinitions';
import { modelDefinitions } from '../../../../../../core/blitzkrieg/modelDefinitions';
import { provisionDefinitions } from '../../../../../../core/blitzkrieg/provisionDefinitions';
import { tankCharacteristics } from '../../../../../../core/blitzkrieg/tankCharacteristics';
import {
  CREW_MEMBER_NAMES,
  GUN_TYPE_NAMES,
  SHELL_NAMES,
} from '../../../../../../core/blitzkrieg/tankDefinitions/constants';
import { useEquipment } from '../../../../../../hooks/useEquipment';
import { useFullScreen } from '../../../../../../hooks/useFullScreen';
import { mutateDuel, useDuel } from '../../../../../../stores/duel';
import { useTankopediaTemporary } from '../../../../../../stores/tankopedia';
import { Info } from './components/Info';
import { InfoWithDelta } from './components/InfoWithDelta';

export function Characteristics() {
  const awaitedEquipmentDefinitions = use(equipmentDefinitions);
  const awaitedModelDefinitions = use(modelDefinitions);
  const awaitedProvisionDefinitions = use(provisionDefinitions);
  const crewSkills = useTankopediaTemporary((state) => state.skills);
  const penetrationDistanceInput = useRef<HTMLInputElement>(null);
  const isFullScreen = useFullScreen();
  const hasImprovedVentilation = useEquipment(102);
  const crewMastery = useDuel((state) => state.protagonist!.crewMastery);
  const [penetrationDistance, setPenetrationDistance] = useState(250);

  const provisions = useDuel((state) => state.protagonist!.provisions);
  const provisionCrewBonus =
    provisions.reduce(
      (total, provision) =>
        awaitedProvisionDefinitions[provision].crew
          ? total + awaitedProvisionDefinitions[provision].crew! / 100
          : total,
      0,
    ) + (hasImprovedVentilation ? 0.05 : 0);
  const commanderMastery = crewMastery + provisionCrewBonus;
  const crewMemberMastery = commanderMastery * 1.1;
  const consumables = useDuel((state) => state.protagonist!.consumables);
  const camouflage = useDuel((state) => state.protagonist!.camouflage);
  const equipmentMatrix = useDuel(
    (state) => state.protagonist!.equipmentMatrix,
  );
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
  const stats = tankCharacteristics(
    {
      tank,
      camouflage,
      consumables,
      crewMastery,
      crewSkills,
      engine,
      equipmentMatrix,
      gun,
      provisions,
      shell,
      turret,
      track,
      stockEngine,
      stockGun,
      stockTrack,
      stockTurret,
      applyReactive: false,
      applyDynamicArmor: false,
      applySpallLiner: false,
    },
    {
      equipmentDefinitions: awaitedEquipmentDefinitions,
      modelDefinitions: awaitedModelDefinitions,
      provisionDefinitions: awaitedProvisionDefinitions,
    },
  );

  const hasSupercharger = useEquipment(107);
  const hasCalibratedShells = useEquipment(103);
  const hasImprovedVerticalStabilizer = useEquipment(122);
  const penetrationCoefficient = coefficient([
    hasCalibratedShells,
    isExplosive(shell.type) ? 0.1 : 0.05,
  ]);
  const penetrationLossOverDistanceCoefficient = coefficient([
    hasSupercharger,
    -0.5,
  ]);

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

  if (isFullScreen) return null;

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
          {stats.dpm}
        </InfoWithDelta>
        {gun.type === 'autoReloader' && (
          <>
            <InfoWithDelta decimals={0} indent name="Maximum" unit="hp / min">
              {stats.dpmMaximum!}
            </InfoWithDelta>
            <InfoWithDelta
              decimals={0}
              indent
              name="Effective at 60s"
              unit="hp / min"
            >
              {stats.dpmEffective!}
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
        {gun.type !== 'regular' && (
          <InfoWithDelta name="Shells">{stats.shells}</InfoWithDelta>
        )}

        {gun.type === 'autoReloader' ? (
          <>
            <Info indent name="Most optimal">
              {stats.mostOptimalShellIndex}
            </Info>
            <Info name="Shell reloads" unit="s" />
            {stats.shellReloads!.map((reload, index) => (
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
            {stats.shellReload!}
          </InfoWithDelta>
        )}
        {(gun.type === 'autoLoader' || gun.type === 'autoReloader') && (
          <InfoWithDelta
            indent
            decimals={2}
            name="Intra-clip"
            unit="s"
            deltaType="lowerIsBetter"
          >
            {stats.intraClip!}
          </InfoWithDelta>
        )}
        <InfoWithDelta name="Caliber" decimals={0} unit="mm">
          {stats.caliber}
        </InfoWithDelta>
        <InfoWithDelta decimals={0} name="Penetration" unit="mm">
          {stats.penetration}
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
              <TextField.Root
                style={{ width: 64 }}
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
              >
                <TextField.Slot side="right">m</TextField.Slot>
              </TextField.Root>
            </Flex>
          </>
        )}
        <InfoWithDelta name="Damage" unit="hp" decimals={0}>
          {stats.damage}
        </InfoWithDelta>
        <InfoWithDelta name="Module damage" unit="hp" decimals={0}>
          {stats.moduleDamage}
        </InfoWithDelta>
        {isExplosive(shell.type) && (
          <InfoWithDelta name="Splash radius" unit="m" decimals={0}>
            {stats.explosionRadius!}
          </InfoWithDelta>
        )}
        <InfoWithDelta name="Shell velocity" unit="m/s" decimals={0}>
          {stats.shellVelocity}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={2}
          name="Aim time"
          unit="s"
          deltaType="lowerIsBetter"
        >
          {stats.aimTime}
        </InfoWithDelta>
        <Info name="Dispersion at 100m" />
        <InfoWithDelta
          decimals={3}
          indent
          name="Still"
          unit="m"
          deltaType="lowerIsBetter"
        >
          {stats.dispersion}
        </InfoWithDelta>
        <InfoWithDelta
          prefix="+ "
          decimals={3}
          indent
          name="Moving"
          deltaType="lowerIsBetter"
        >
          {stats.dispersionMoving}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={3}
          prefix="+ "
          indent
          name="Hull traversing"
          deltaType="lowerIsBetter"
        >
          {stats.dispersionHullTraversing}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={3}
          prefix="+ "
          indent
          name="Turret traversing"
          deltaType="lowerIsBetter"
        >
          {stats.dispersionTurretTraversing}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={3}
          prefix="+ "
          indent
          name="After shooting"
          deltaType="lowerIsBetter"
        >
          {stats.dispersionShooting}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={1}
          prefix="x "
          indent
          name="Gun damaged"
          unit="scalar"
          deltaType="lowerIsBetter"
        >
          {stats.dispersionGunDamaged}
        </InfoWithDelta>
        <Info name="Gun flexibility" unit="°" />
        <InfoWithDelta decimals={1} indent name="Depression">
          {stats.gunDepression}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="Elevation">
          {stats.gunElevation}
        </InfoWithDelta>
        {gunModelDefinition.pitch.front && (
          <>
            <InfoWithDelta decimals={1} indent name="Frontal depression">
              {stats.gunFrontalDepression!}
            </InfoWithDelta>
            <InfoWithDelta decimals={1} indent name="Frontal elevation">
              {stats.gunFrontalElevation!}
            </InfoWithDelta>
          </>
        )}
        {gunModelDefinition.pitch.back && (
          <>
            <InfoWithDelta decimals={1} indent name="Rear depression">
              {stats.gunRearDepression!}
            </InfoWithDelta>
            <InfoWithDelta decimals={1} indent name="Rear elevation">
              {stats.gunRearElevation!}
            </InfoWithDelta>
          </>
        )}
        {turretModelDefinition.yaw && (
          <>
            <InfoWithDelta decimals={1} indent name="Azimuth left">
              {stats.azimuthLeft!}
            </InfoWithDelta>
            <InfoWithDelta decimals={1} indent name="Azimuth right">
              {stats.azimuthRight!}
            </InfoWithDelta>
          </>
        )}
      </Flex>

      <Flex direction="column" gap="2">
        <Heading size="5">Maneuverability</Heading>
        <Info name="Speed" unit="km/hr" />
        <InfoWithDelta decimals={0} indent name="Forwards">
          {stats.speedForwards}
        </InfoWithDelta>
        <InfoWithDelta decimals={0} indent name="Backwards">
          {stats.speedBackwards}
        </InfoWithDelta>
        <InfoWithDelta decimals={0} name="Engine power" unit="hp">
          {stats.enginePower}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={1}
          name="Weight"
          unit="tn"
          deltaType="lowerIsBetter"
        >
          {stats.weight}
        </InfoWithDelta>
        <Info name="Power to weight ratio" unit="hp/tn" />
        <InfoWithDelta decimals={1} indent name="On hard terrain">
          {stats.powerToWeightRatioHardTerrain}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="On medium terrain">
          {stats.powerToWeightRatioMediumTerrain}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="On soft terrain">
          {stats.powerToWeightRatioSoftTerrain}
        </InfoWithDelta>
        <InfoWithDelta name="Turret traverse speed" unit="°/s" decimals={1}>
          {stats.turretTraverseSpeed}
        </InfoWithDelta>
        <Info name="Hull traverse speed" unit="°/s" />
        <InfoWithDelta decimals={1} indent name="On hard terrain">
          {stats.hullTraverseHardTerrain}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="On medium terrain">
          {stats.hullTraverseMediumTerrain}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="On soft terrain">
          {stats.hullTraverseSoftTerrain}
        </InfoWithDelta>
      </Flex>

      <Flex direction="column" gap="2">
        <Heading size="5">Survivability</Heading>
        <InfoWithDelta name="Health" unit="hp" decimals={0}>
          {stats.health}
        </InfoWithDelta>
        <InfoWithDelta
          name="Fire chance"
          unit="%"
          deltaType="lowerIsBetter"
          decimals={0}
        >
          {stats.fireChance * 100}
        </InfoWithDelta>
        <InfoWithDelta name="View range" unit="m" decimals={0}>
          {stats.viewRange}
        </InfoWithDelta>
        <Info name="Camouflage" unit="%" />
        <InfoWithDelta indent name="Still" decimals={0}>
          {stats.camouflageStill * 100}
        </InfoWithDelta>
        <InfoWithDelta indent name="Moving" decimals={0}>
          {stats.camouflageMoving * 100}
        </InfoWithDelta>
        <InfoWithDelta indent name="Shooting still" decimals={0}>
          {stats.camouflageShootingStill * 100}
        </InfoWithDelta>
        <InfoWithDelta indent name="Shooting moving" decimals={0}>
          {stats.camouflageShootingMoving * 100}
        </InfoWithDelta>
        <InfoWithDelta indent name="Caught on fire" decimals={0}>
          {stats.camouflageCaughtOnFire * 100}
        </InfoWithDelta>
        <Info name="Width" unit="m" decimals={0} deltaType="lowerIsBetter">
          {stats.width}
        </Info>
        <Info name="Height" unit="m" decimals={0} deltaType="lowerIsBetter">
          {stats.height}
        </Info>
        <Info name="Length" unit="m" decimals={0} deltaType="lowerIsBetter">
          {stats.length}
        </Info>
        <Info name="Volume" unit="m" decimals={0} deltaType="lowerIsBetter">
          {stats.volume}
        </Info>
      </Flex>

      <Flex direction="column" gap="2">
        <Flex gap="2" align="center">
          <Heading size="5">Crew training</Heading>

          <Popover.Root>
            <Popover.Trigger>
              <IconButton variant="ghost">
                <InfoCircledIcon />
              </IconButton>
            </Popover.Trigger>

            <Popover.Content>
              <Flex gap="1" align="center">
                <AccessibilityIcon />
                <Text>represents the other roles a crew member can take.</Text>
              </Flex>
            </Popover.Content>
          </Popover.Root>
        </Flex>

        {tank.crew.map((member) => {
          const count = member.count ?? 1;

          return (
            <Fragment key={member.type}>
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
            </Fragment>
          );
        })}
      </Flex>
    </Flex>
  );
}
