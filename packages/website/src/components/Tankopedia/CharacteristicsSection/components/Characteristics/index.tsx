import {
  asset,
  coefficient,
  CREW_MEMBER_NAMES,
  CrewType,
  fetchEquipmentDefinitions,
  fetchProvisionDefinitions,
  GUN_TYPE_NAMES,
  isExplosive,
  resolvePenetrationCoefficient,
} from '@blitzkit/core';
import { AccessibilityIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import {
  Flex,
  Heading,
  IconButton,
  Popover,
  Slider,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes';
import { debounce } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { lerp } from 'three/src/math/MathUtils.js';
import { applyPitchYawLimits } from '../../../../../core/blitz/applyPitchYawLimits';
import { tankCharacteristics } from '../../../../../core/blitzkit/tankCharacteristics';
import { useAdExempt } from '../../../../../hooks/useAdExempt';
import { useEquipment } from '../../../../../hooks/useEquipment';
import { useTankModelDefinition } from '../../../../../hooks/useTankModelDefinition';
import { Duel } from '../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../stores/tankopediaEphemeral';
import { Info } from './components/Info';
import { InfoWithDelta } from './components/InfoWithDelta';

const equipmentDefinitions = await fetchEquipmentDefinitions();
const provisionDefinitions = await fetchProvisionDefinitions();

export function Characteristics() {
  const mutateDuel = Duel.useMutation();
  const exempt = useAdExempt();
  const crewSkills = TankopediaEphemeral.use((state) => state.skills);
  const penetrationDistanceInput = useRef<HTMLInputElement>(null);
  const hasImprovedVentilation = useEquipment(102);
  const crewMastery = Duel.use((state) => state.protagonist.crewMastery);
  const [penetrationDistance, setPenetrationDistance] = useState(250);
  const setPenetrationDistanceDebounced = debounce((value: number) => {
    setPenetrationDistance(value);
  }, 500);

  const provisions = Duel.use((state) => state.protagonist.provisions);
  const provisionCrewBonus =
    provisions.reduce(
      (total, provision) =>
        provisionDefinitions.provisions[provision].crew
          ? total + provisionDefinitions.provisions[provision].crew! / 100
          : total,
      0,
    ) + (hasImprovedVentilation ? 0.08 : 0);
  const commanderMastery = crewMastery + provisionCrewBonus;
  const consumables = Duel.use((state) => state.protagonist.consumables);
  const camouflage = Duel.use((state) => state.protagonist.camouflage);
  const equipmentMatrix = Duel.use(
    (state) => state.protagonist.equipmentMatrix,
  );
  const { tank, turret, gun, engine, track, shell } = Duel.use(
    (state) => state.protagonist,
  );
  const stockEngine = tank.engines[0];
  const stockTrack = tank.tracks[0];
  const stockTurret = tank.turrets[0];
  const stockGun = stockTurret.guns[0];
  const tankModelDefinition = useTankModelDefinition();
  const turretModelDefinition = tankModelDefinition.turrets[turret.id];
  const gunModelDefinition =
    turretModelDefinition.guns[gun.gun_type!.value.base.id];
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
      applyReactiveArmor: false,
      applyDynamicArmor: false,
      applySpallLiner: false,
    },
    {
      tankModelDefinition,
      equipmentDefinitions: equipmentDefinitions,
      provisionDefinitions: provisionDefinitions,
    },
  );

  const hasSupercharger = useEquipment(107);
  const hasCalibratedShells = useEquipment(103);
  const hasImprovedVerticalStabilizer = useEquipment(122);
  const penetrationCoefficient = coefficient([
    hasCalibratedShells,
    resolvePenetrationCoefficient(true, shell.type) - 1,
  ]);
  const penetrationLossOverDistanceCoefficient = coefficient([
    hasSupercharger,
    -0.6,
  ]);

  useEffect(() => {
    if (penetrationDistanceInput.current) {
      penetrationDistanceInput.current.value = `${penetrationDistance}`;
    }
  }, [penetrationDistance]);
  useEffect(() => {
    mutateDuel((draft) => {
      [draft.protagonist.pitch, draft.protagonist.yaw] = applyPitchYawLimits(
        draft.protagonist.pitch,
        draft.protagonist.yaw,
        gunModelDefinition.pitch,
        turretModelDefinition.yaw,
        hasImprovedVerticalStabilizer,
      );
    });
  }, [hasImprovedVerticalStabilizer]);

  return (
    <Flex
      gap="8"
      direction={{
        initial: 'column',
        md: 'row',
      }}
    >
      <Flex direction="column" gap="8" style={{ flex: 1 }}>
        <Flex direction="column" gap="2">
          <Flex align="center" gap="4">
            <Heading size="5">Firepower</Heading>

            <Flex>
              {gun.gun_type!.value.base.shells.map((thisShell, shellIndex) => (
                <Tooltip content={thisShell.name} key={thisShell.id}>
                  <IconButton
                    color={thisShell.id === shell.id ? undefined : 'gray'}
                    variant="soft"
                    style={{
                      borderTopLeftRadius: shellIndex === 0 ? undefined : 0,
                      borderBottomLeftRadius: shellIndex === 0 ? undefined : 0,
                      borderTopRightRadius:
                        shellIndex ===
                        gun.gun_type!.value.base.shells.length - 1
                          ? undefined
                          : 0,
                      borderBottomRightRadius:
                        shellIndex ===
                        gun.gun_type!.value.base.shells.length - 1
                          ? undefined
                          : 0,
                      marginLeft: shellIndex === 0 ? 0 : -1,
                    }}
                    onClick={() => {
                      mutateDuel((draft) => {
                        draft.protagonist.shell = thisShell;
                      });
                    }}
                  >
                    <img
                      alt={thisShell.name}
                      width={16}
                      height={16}
                      src={asset(`icons/shells/${thisShell.icon}.webp`)}
                    />
                  </IconButton>
                </Tooltip>
              ))}
            </Flex>
          </Flex>
          <Info name="Gun type">{GUN_TYPE_NAMES[gun.gun_type!.$case]}</Info>
          <InfoWithDelta name="DPM" decimals={0} unit="hp / min">
            {stats.dpm}
          </InfoWithDelta>
          {gun.gun_type!.$case === 'auto_reloader' && (
            <InfoWithDelta
              decimals={0}
              indent
              name="Effective at 60s"
              unit="hp / min"
            >
              {stats.dpmEffective!}
            </InfoWithDelta>
          )}
          {gun.gun_type!.$case !== 'regular' && (
            <InfoWithDelta name="Shells">{stats.shells}</InfoWithDelta>
          )}
          {gun.gun_type!.$case === 'auto_reloader' ? (
            <>
              <Info indent name="Most optimal shell index">
                {stats.mostOptimalShellIndex! + 1}
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
          {(gun.gun_type!.$case === 'auto_loader' ||
            gun.gun_type!.$case === 'auto_reloader') && (
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
                  shell.penetration.near,
                  shell.penetration.far,
                  (penetrationDistance *
                    penetrationLossOverDistanceCoefficient) /
                    500,
                ) * penetrationCoefficient}
              </InfoWithDelta>
              <Flex align="center" gap="2" style={{ paddingLeft: 24 }}>
                <Text color="gray">Distance</Text>
                <Slider
                  key={penetrationDistance}
                  min={0}
                  max={500}
                  style={{ flex: 1 }}
                  defaultValue={[penetrationDistance]}
                  onValueChange={([value]) => {
                    setPenetrationDistanceDebounced(value);

                    if (!penetrationDistanceInput.current) return;

                    penetrationDistanceInput.current.value = value.toString();
                  }}
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
          {gun.gun_type!.$case !== 'regular' && (
            <InfoWithDelta name="Clipping potential" indent>
              {stats.clipDamage!}
            </InfoWithDelta>
          )}
          <InfoWithDelta name="Module damage" unit="hp" decimals={0}>
            {stats.moduleDamage}
          </InfoWithDelta>
          {isExplosive(shell.type) && (
            <InfoWithDelta name="Splash radius" unit="m" decimals={0}>
              {stats.explosionRadius!}
            </InfoWithDelta>
          )}
          <InfoWithDelta name="Caliber" decimals={0} unit="mm">
            {stats.caliber}
          </InfoWithDelta>
          <InfoWithDelta name="Normalization" decimals={0} unit="°">
            {stats.shellNormalization}
          </InfoWithDelta>
          {!isExplosive(shell.type) && (
            <InfoWithDelta
              name="Ricochet"
              decimals={0}
              deltaType="lowerIsBetter"
              unit="°"
            >
              {stats.shellRicochet!}
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
            prefix="+"
            decimals={3}
            indent
            name="Moving"
            deltaType="lowerIsBetter"
          >
            {stats.dispersionMoving}
          </InfoWithDelta>
          <InfoWithDelta
            decimals={3}
            prefix="+"
            indent
            name="Hull traversing"
            deltaType="lowerIsBetter"
          >
            {stats.dispersionHullTraversing}
          </InfoWithDelta>
          <InfoWithDelta
            decimals={3}
            prefix="+"
            indent
            name="Turret traversing"
            deltaType="lowerIsBetter"
          >
            {stats.dispersionTurretTraversing}
          </InfoWithDelta>
          <InfoWithDelta
            decimals={3}
            prefix="+"
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
                  <Text>
                    represents the other roles a crew member can take.
                  </Text>
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
                  name={`${CREW_MEMBER_NAMES[member.type]}${
                    count > 1 ? ` x ${count}` : ''
                  }`}
                  unit="%"
                  decimals={0}
                >
                  {(member.type === CrewType.COMMANDER
                    ? commanderMastery
                    : commanderMastery * 1.1) * 100}
                </InfoWithDelta>

                {member.substitute && (
                  <InfoWithDelta
                    key={`${member.type}-substitute`}
                    decimals={0}
                    unit="%"
                    indent
                    name={
                      <>
                        <Flex align="center" gap="1" display="inline-flex">
                          <AccessibilityIcon />
                          {member.substitute
                            .map((sub, index) =>
                              index === 0 ? CREW_MEMBER_NAMES[sub] : sub,
                            )
                            .join(', ')}
                        </Flex>
                      </>
                    }
                  >
                    {commanderMastery * 1.05 * 100}
                  </InfoWithDelta>
                )}
              </Fragment>
            );
          })}
        </Flex>
      </Flex>

      {/* AD TODO: */}
      {/* {!exempt && (
        <Flex
          justify="center"
          display={{
            initial: 'flex',
            xs: 'none',
          }}
        >
          <Ad type={AdType.MediumRectangleHorizontalPurple} />
        </Flex>
      )} */}

      <Flex direction="column" gap="8" style={{ flex: 1 }}>
        <Flex direction="column" gap="2">
          <Heading size="5">Maneuverability</Heading>
          <Info name="Speed" unit="kph" />
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
          <Info name="Terrain coefficients" />
          <InfoWithDelta decimals={0} unit="%" indent name="Hard">
            {stats.hardTerrainCoefficient}
          </InfoWithDelta>
          <InfoWithDelta decimals={0} unit="%" indent name="Medium">
            {stats.mediumTerrainCoefficient}
          </InfoWithDelta>
          <InfoWithDelta decimals={0} unit="%" indent name="Soft">
            {stats.softTerrainCoefficient}
          </InfoWithDelta>
          <Info name="Raw terrain coefficients" />
          <InfoWithDelta decimals={2} unit="%" indent name="Hard">
            {stats.hardTerrainCoefficientRaw}
          </InfoWithDelta>
          <InfoWithDelta decimals={2} unit="%" indent name="Medium">
            {stats.mediumTerrainCoefficientRaw}
          </InfoWithDelta>
          <InfoWithDelta decimals={2} unit="%" indent name="Soft">
            {stats.softTerrainCoefficientRaw}
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
      </Flex>
    </Flex>
  );
}
