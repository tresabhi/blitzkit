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
  const crewSkills = TankopediaEphemeral.use((state) => state.skills);
  const penetrationDistanceInput = useRef<HTMLInputElement>(null);
  const hasImprovedVentilation = useEquipment(102);
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
  const commanderMastery = 1 + provisionCrewBonus;
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
          <InfoWithDelta
            stats={stats}
            name="DPM"
            decimals={0}
            unit="hp / min"
            value="dpm"
          />
          {gun.gun_type!.$case === 'auto_reloader' && (
            <InfoWithDelta
              stats={stats}
              decimals={0}
              indent
              name="Effective at 60s"
              unit="hp / min"
              value="dpmEffective"
            />
          )}
          {gun.gun_type!.$case !== 'regular' && (
            <InfoWithDelta stats={stats} name="Shells" value="shells" />
          )}
          {gun.gun_type!.$case === 'auto_reloader' ? (
            <>
              <Info indent name="Most optimal shell index">
                {stats.mostOptimalShellIndex! + 1}
              </Info>
              <Info name="Shell reloads" unit="s" />
              {stats.shellReloads!.map((reload, index) => (
                <InfoWithDelta
                  stats={stats}
                  key={index}
                  indent
                  name={`Shell ${index + 1}`}
                  decimals={2}
                  deltaType="lowerIsBetter"
                  noRanking
                  value={() => reload}
                />
              ))}
            </>
          ) : (
            <InfoWithDelta
              stats={stats}
              decimals={2}
              name="Reload"
              unit="s"
              deltaType="lowerIsBetter"
              value="shellReload"
            />
          )}
          {(gun.gun_type!.$case === 'auto_loader' ||
            gun.gun_type!.$case === 'auto_reloader') && (
            <InfoWithDelta
              stats={stats}
              indent
              decimals={2}
              name="Intra-clip"
              unit="s"
              deltaType="lowerIsBetter"
              value="intraClip"
            />
          )}
          <InfoWithDelta
            stats={stats}
            decimals={0}
            name="Penetration"
            unit="mm"
            value="penetration"
          />
          {typeof shell.penetration !== 'number' && (
            <>
              <InfoWithDelta
                stats={stats}
                indent
                decimals={0}
                name={`At ${penetrationDistance}m`}
                noRanking
                value={() =>
                  lerp(
                    shell.penetration.near,
                    shell.penetration.far,
                    (penetrationDistance *
                      penetrationLossOverDistanceCoefficient) /
                      500,
                  ) * penetrationCoefficient
                }
              />
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
          <InfoWithDelta
            stats={stats}
            name="Damage"
            unit="hp"
            decimals={0}
            value="damage"
          />
          {gun.gun_type!.$case !== 'regular' && (
            <InfoWithDelta
              stats={stats}
              name="Clipping potential"
              indent
              decimals={0}
              value="clipDamage"
            />
          )}
          <InfoWithDelta
            stats={stats}
            name="Module damage"
            unit="hp"
            decimals={0}
            value="moduleDamage"
          />
          {isExplosive(shell.type) && (
            <InfoWithDelta
              stats={stats}
              name="Splash radius"
              unit="m"
              noRanking
              decimals={0}
              value="explosionRadius"
            />
          )}
          <InfoWithDelta
            stats={stats}
            name="Caliber"
            decimals={0}
            unit="mm"
            value="caliber"
          />
          <InfoWithDelta
            stats={stats}
            name="Normalization"
            decimals={0}
            unit="°"
            noRanking
            value="shellNormalization"
          />
          {!isExplosive(shell.type) && (
            <InfoWithDelta
              stats={stats}
              name="Ricochet"
              noRanking
              decimals={0}
              deltaType="lowerIsBetter"
              unit="°"
              value="shellRicochet"
            />
          )}
          <InfoWithDelta
            stats={stats}
            name="Shell velocity"
            unit="m/s"
            decimals={0}
            value="shellVelocity"
          />
          <InfoWithDelta
            stats={stats}
            name="Shell range"
            unit="m/s"
            decimals={0}
            value="shellRange"
          />
          <InfoWithDelta
            stats={stats}
            name="Shell capacity"
            unit="m/s"
            decimals={0}
            value="shellCapacity"
          />
          <InfoWithDelta
            stats={stats}
            decimals={2}
            name="Aim time"
            unit="s"
            deltaType="lowerIsBetter"
            value="aimTime"
          />
          <Info name="Dispersion at 100m" />
          <InfoWithDelta
            stats={stats}
            decimals={3}
            indent
            name="Still"
            unit="m"
            deltaType="lowerIsBetter"
            value="dispersion"
          />
          <InfoWithDelta
            stats={stats}
            prefix="+"
            decimals={3}
            indent
            name="Moving"
            deltaType="lowerIsBetter"
            value="dispersionMoving"
          />
          <InfoWithDelta
            stats={stats}
            decimals={3}
            prefix="+"
            indent
            name="Hull traversing"
            deltaType="lowerIsBetter"
            value="dispersionHullTraversing"
          />
          <InfoWithDelta
            stats={stats}
            decimals={3}
            prefix="+"
            indent
            name="Turret traversing"
            deltaType="lowerIsBetter"
            value="dispersionTurretTraversing"
          />
          <InfoWithDelta
            stats={stats}
            decimals={3}
            prefix="+"
            indent
            name="After shooting"
            deltaType="lowerIsBetter"
            value="dispersionShooting"
          />
          <InfoWithDelta
            stats={stats}
            decimals={1}
            prefix="x "
            indent
            name="Gun damaged"
            unit="scalar"
            deltaType="lowerIsBetter"
            value="dispersionGunDamaged"
          />
          <Info name="Gun flexibility" unit="°" />
          <InfoWithDelta
            value="gunDepression"
            stats={stats}
            decimals={1}
            indent
            name="Depression"
          />
          <InfoWithDelta
            stats={stats}
            decimals={1}
            indent
            name="Elevation"
            value="gunElevation"
          />
          {gunModelDefinition.pitch.front && (
            <>
              <InfoWithDelta
                stats={stats}
                decimals={1}
                indent
                name="Frontal depression"
                value="gunFrontalDepression"
              />
              <InfoWithDelta
                stats={stats}
                decimals={1}
                indent
                name="Frontal elevation"
                value="gunFrontalElevation"
              />
            </>
          )}
          {gunModelDefinition.pitch.back && (
            <>
              <InfoWithDelta
                stats={stats}
                decimals={1}
                indent
                name="Rear depression"
                value="gunRearDepression"
              />
              <InfoWithDelta
                stats={stats}
                decimals={1}
                indent
                name="Rear elevation"
                value="gunRearElevation"
              />
            </>
          )}
          {turretModelDefinition.yaw && (
            <>
              <InfoWithDelta
                stats={stats}
                decimals={1}
                indent
                name="Azimuth left"
                value="azimuthLeft"
              />
              <InfoWithDelta
                stats={stats}
                decimals={1}
                indent
                name="Azimuth right"
                value="azimuthRight"
              />
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

          <InfoWithDelta
            value="crewCount"
            stats={stats}
            name="Crew count"
            decimals={0}
          />

          {tank.crew.map((member) => {
            return (
              <Fragment key={member.type}>
                <InfoWithDelta
                  stats={stats}
                  key={`${member.type}-root`}
                  name={`${CREW_MEMBER_NAMES[member.type]}${
                    member.count > 1 ? ` x ${member.count}` : ''
                  }`}
                  unit="%"
                  decimals={0}
                  noRanking
                  value={() =>
                    (member.type === CrewType.COMMANDER
                      ? commanderMastery
                      : commanderMastery * 1.1) * 100
                  }
                />

                {member.substitute.length > 0 && (
                  <InfoWithDelta
                    stats={stats}
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
                    noRanking
                    value={() => commanderMastery * 1.05 * 100}
                  />
                )}
              </Fragment>
            );
          })}
        </Flex>
      </Flex>

      <Flex direction="column" gap="8" style={{ flex: 1 }}>
        <Flex direction="column" gap="2">
          <Heading size="5">Maneuverability</Heading>
          <Info name="Speed" unit="kph" />
          <InfoWithDelta
            value="speedForwards"
            stats={stats}
            decimals={0}
            indent
            name="Forwards"
          />
          <InfoWithDelta
            value="speedBackwards"
            stats={stats}
            decimals={0}
            indent
            name="Backwards"
          />
          <InfoWithDelta
            stats={stats}
            decimals={0}
            name="Engine power"
            unit="hp"
            value="enginePower"
          />
          <InfoWithDelta
            stats={stats}
            decimals={1}
            name="Weight"
            unit="tn"
            deltaType="lowerIsBetter"
            value="weight"
          />
          <Info name="Terrain coefficients" />
          <InfoWithDelta
            value="hardTerrainCoefficient"
            stats={stats}
            decimals={0}
            unit="%"
            indent
            name="Hard"
          />
          <InfoWithDelta
            stats={stats}
            decimals={0}
            unit="%"
            indent
            name="Medium"
            value="mediumTerrainCoefficient"
          />
          <InfoWithDelta
            value="softTerrainCoefficient"
            stats={stats}
            decimals={0}
            unit="%"
            indent
            name="Soft"
          />
          <Info name="Raw terrain coefficients" deltaType="lowerIsBetter" />
          <InfoWithDelta
            value="hardTerrainCoefficientRaw"
            stats={stats}
            decimals={2}
            unit="%"
            indent
            deltaType="lowerIsBetter"
            name="Hard"
          />
          <InfoWithDelta
            stats={stats}
            decimals={2}
            unit="%"
            indent
            name="Medium"
            deltaType="lowerIsBetter"
            value="mediumTerrainCoefficientRaw"
          />
          <InfoWithDelta
            stats={stats}
            decimals={2}
            unit="%"
            indent
            name="Soft"
            deltaType="lowerIsBetter"
            value="softTerrainCoefficientRaw"
          />
          <Info name="Power to weight ratio" unit="hp/tn" />
          <InfoWithDelta
            stats={stats}
            decimals={1}
            indent
            name="On hard terrain"
            value="powerToWeightRatioHardTerrain"
          />
          <InfoWithDelta
            stats={stats}
            decimals={1}
            indent
            name="On medium terrain"
            value="powerToWeightRatioMediumTerrain"
          />
          <InfoWithDelta
            stats={stats}
            decimals={1}
            indent
            name="On soft terrain"
            value="powerToWeightRatioSoftTerrain"
          />
          <InfoWithDelta
            stats={stats}
            name="Turret traverse speed"
            unit="°/s"
            decimals={1}
            value="turretTraverseSpeed"
          />
          <Info name="Hull traverse speed" unit="°/s" />
          <InfoWithDelta
            stats={stats}
            decimals={1}
            indent
            name="On hard terrain"
            value="hullTraverseHardTerrain"
          />
          <InfoWithDelta
            stats={stats}
            decimals={1}
            indent
            name="On medium terrain"
            value="hullTraverseMediumTerrain"
          />
          <InfoWithDelta
            stats={stats}
            decimals={1}
            indent
            name="On soft terrain"
            value="hullTraverseSoftTerrain"
          />
        </Flex>

        <Flex direction="column" gap="2">
          <Heading size="5">Survivability</Heading>
          <InfoWithDelta
            value="health"
            stats={stats}
            name="Health"
            unit="hp"
            decimals={0}
          />
          <InfoWithDelta
            stats={stats}
            name="Fire chance"
            unit="%"
            deltaType="lowerIsBetter"
            decimals={0}
            value={(stats) => stats.fireChance * 100}
          />
          <InfoWithDelta
            value="viewRange"
            stats={stats}
            name="View range"
            unit="m"
            decimals={0}
          />
          <Info name="Camouflage" unit="%" />
          <InfoWithDelta
            value={(stats) => stats.camouflageStill * 100}
            stats={stats}
            indent
            name="Still"
            decimals={2}
          />
          <InfoWithDelta
            value={(stats) => stats.camouflageMoving * 100}
            stats={stats}
            indent
            name="Moving"
            decimals={2}
          />
          <InfoWithDelta
            stats={stats}
            indent
            name="Shooting still"
            decimals={2}
            value={(stats) => stats.camouflageShootingStill * 100}
          />
          <InfoWithDelta
            stats={stats}
            indent
            name="Shooting moving"
            decimals={2}
            value={(stats) => stats.camouflageShootingMoving * 100}
          />
          <InfoWithDelta
            stats={stats}
            indent
            name="Caught on fire"
            decimals={2}
            value={(stats) => stats.camouflageCaughtOnFire * 100}
          />
          <InfoWithDelta
            name="Width"
            unit="m"
            decimals={0}
            deltaType="lowerIsBetter"
            stats={stats}
            value="width"
          />
          <InfoWithDelta
            name="Height"
            unit="m"
            decimals={0}
            deltaType="lowerIsBetter"
            stats={stats}
            value="height"
          />
          <InfoWithDelta
            name="Length"
            unit="m"
            decimals={0}
            deltaType="lowerIsBetter"
            stats={stats}
            value="length"
          />
          <InfoWithDelta
            name="Volume"
            unit="m"
            decimals={0}
            deltaType="lowerIsBetter"
            stats={stats}
            value="volume"
          />
        </Flex>
      </Flex>
    </Flex>
  );
}
