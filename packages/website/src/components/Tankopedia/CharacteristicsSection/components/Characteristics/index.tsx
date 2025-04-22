import {
  asset,
  coefficient,
  CREW_MEMBER_NAMES,
  CrewType,
  isExplosive,
  resolvePenetrationCoefficient,
} from '@blitzkit/core';
import { literals } from '@blitzkit/i18n/src/literals';
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
import { awaitableEquipmentDefinitions } from '../../../../../core/awaitables/equipmentDefinitions';
import { awaitableProvisionDefinitions } from '../../../../../core/awaitables/provisionDefinitions';
import { applyPitchYawLimits } from '../../../../../core/blitz/applyPitchYawLimits';
import { tankCharacteristics } from '../../../../../core/blitzkit/tankCharacteristics';
import { useEquipment } from '../../../../../hooks/useEquipment';
import { useLocale } from '../../../../../hooks/useLocale';
import { useTankModelDefinition } from '../../../../../hooks/useTankModelDefinition';
import { Duel } from '../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../stores/tankopediaEphemeral';
import { HullTraverseVisualizer } from './components/HullTraverseVisualizer';
import { Info } from './components/Info';
import { InfoWithDelta } from './components/InfoWithDelta';
import { RicochetVisualizer } from './components/RicochetVisualizer';
import { ViewRangeVisualizer } from './components/ViewRangeVisualizer';

const [equipmentDefinitions, provisionDefinitions] = await Promise.all([
  awaitableEquipmentDefinitions,
  awaitableProvisionDefinitions,
]);

export function Characteristics() {
  const { unwrap, strings } = useLocale();
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
  const hasDownImprovedVerticalStabilizer = useEquipment(124);
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
        hasDownImprovedVerticalStabilizer,
      );
    });
  }, [hasImprovedVerticalStabilizer, hasDownImprovedVerticalStabilizer]);

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
            <Heading size="5">
              {strings.website.tools.tankopedia.firepower.title}
            </Heading>

            <Flex>
              {gun.gun_type!.value.base.shells.map((thisShell, shellIndex) => (
                <Tooltip content={unwrap(thisShell.name)} key={thisShell.id}>
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
                      alt={unwrap(thisShell.name)}
                      width={16}
                      height={16}
                      src={asset(`icons/shells/${thisShell.icon}.webp`)}
                    />
                  </IconButton>
                </Tooltip>
              ))}
            </Flex>
          </Flex>
          <Info
            name={
              strings.website.tools.tankopedia.characteristics.values.gunType
            }
          >
            {strings.common.gun_types[gun.gun_type!.$case]}
          </Info>
          <InfoWithDelta
            stats={stats}
            decimals={0}
            unit="hp / min"
            value="dpm"
          />
          {gun.gun_type!.$case === 'auto_reloader' && (
            <InfoWithDelta
              stats={stats}
              decimals={0}
              indent
              unit="hp / min"
              value="dpmEffective"
            />
          )}
          {gun.gun_type!.$case !== 'regular' && (
            <InfoWithDelta stats={stats} value="shells" />
          )}
          {gun.gun_type!.$case === 'auto_reloader' ? (
            <>
              <Info
                indent
                name={
                  strings.website.tools.tankopedia.characteristics.values
                    .mostOptimalShellIndex
                }
              >
                {stats.mostOptimalShellIndex! + 1}
              </Info>
              <Info
                name={
                  strings.website.tools.tankopedia.characteristics.values
                    .shellReloads
                }
                unit="s"
              />
              {stats.shellReloads!.map((reload, index) => (
                <InfoWithDelta
                  stats={stats}
                  key={index}
                  indent
                  name={literals(
                    strings.website.tools.tankopedia.characteristics.values
                      .shell_index,
                    [`${index + 1}`],
                  )}
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
              unit="s"
              deltaType="lowerIsBetter"
              value="intraClip"
            />
          )}
          <InfoWithDelta
            stats={stats}
            decimals={0}
            unit="mm"
            value="penetration"
          />
          {typeof shell.penetration !== 'number' && (
            <>
              <InfoWithDelta
                stats={stats}
                indent
                decimals={0}
                name={literals(
                  strings.website.tools.tankopedia.characteristics.values
                    .at_distance,
                  [`${penetrationDistance}`],
                )}
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
                <Text color="gray">
                  {
                    strings.website.tools.tankopedia.characteristics.values
                      .at_distance_slider_label
                  }
                </Text>
                <Slider
                  variant="classic"
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
                  variant="classic"
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
          <InfoWithDelta stats={stats} unit="hp" decimals={0} value="damage" />
          {gun.gun_type!.$case !== 'regular' && (
            <InfoWithDelta
              stats={stats}
              indent
              decimals={0}
              value="clipDamage"
            />
          )}
          <InfoWithDelta
            stats={stats}
            unit="hp"
            decimals={0}
            value="moduleDamage"
          />
          {isExplosive(shell.type) && (
            <InfoWithDelta
              stats={stats}
              unit="m"
              noRanking
              decimals={0}
              value="explosionRadius"
            />
          )}
          <InfoWithDelta stats={stats} decimals={0} unit="mm" value="caliber" />

          {!isExplosive(shell.type) && (
            <>
              <InfoWithDelta
                stats={stats}
                decimals={0}
                unit="°"
                noRanking
                value="shellNormalization"
              />
              <InfoWithDelta
                stats={stats}
                noRanking
                decimals={0}
                deltaType="lowerIsBetter"
                unit="°"
                value="shellRicochet"
              />
              <RicochetVisualizer stats={stats} />
            </>
          )}
          <InfoWithDelta
            stats={stats}
            unit="m/s"
            decimals={0}
            value="shellVelocity"
          />
          <InfoWithDelta
            stats={stats}
            unit="m"
            decimals={0}
            value="shellRange"
          />
          <InfoWithDelta stats={stats} decimals={0} value="shellCapacity" />
          <InfoWithDelta
            stats={stats}
            decimals={2}
            unit="s"
            deltaType="lowerIsBetter"
            value="aimTime"
          />
          <Info
            name={literals(
              strings.website.tools.tankopedia.characteristics.values
                .dispersion_at_distance,
              ['100'],
            )}
          />
          <InfoWithDelta
            stats={stats}
            decimals={3}
            indent
            unit="m"
            deltaType="lowerIsBetter"
            value="dispersion"
          />
          <InfoWithDelta
            stats={stats}
            prefix="+"
            decimals={3}
            indent
            deltaType="lowerIsBetter"
            value="dispersionMoving"
          />
          <InfoWithDelta
            stats={stats}
            decimals={3}
            prefix="+"
            indent
            deltaType="lowerIsBetter"
            value="dispersionHullTraversing"
          />
          <InfoWithDelta
            stats={stats}
            decimals={3}
            prefix="+"
            indent
            deltaType="lowerIsBetter"
            value="dispersionTurretTraversing"
          />
          <InfoWithDelta
            stats={stats}
            decimals={3}
            prefix="+"
            indent
            deltaType="lowerIsBetter"
            value="dispersionShooting"
          />
          <InfoWithDelta
            stats={stats}
            decimals={1}
            prefix="x "
            indent
            deltaType="lowerIsBetter"
            value="dispersionGunDamaged"
          />
          <Info
            name={
              strings.website.tools.tankopedia.characteristics.values
                .gun_flexibility
            }
            unit="°"
          />
          <InfoWithDelta
            value="gunDepression"
            stats={stats}
            decimals={1}
            indent
          />
          <InfoWithDelta
            stats={stats}
            decimals={1}
            indent
            value="gunElevation"
          />
          {gunModelDefinition.pitch.front && (
            <>
              <InfoWithDelta
                stats={stats}
                decimals={1}
                indent
                value="gunFrontalDepression"
              />
              <InfoWithDelta
                stats={stats}
                decimals={1}
                indent
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
                value="gunRearDepression"
              />
              <InfoWithDelta
                stats={stats}
                decimals={1}
                indent
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
                value="azimuthLeft"
              />
              <InfoWithDelta
                stats={stats}
                decimals={1}
                indent
                value="azimuthRight"
              />
            </>
          )}
        </Flex>

        <Flex direction="column" gap="2">
          <Flex gap="2" align="center">
            <Heading size="5">
              {strings.website.tools.tankopedia.crew.title}
            </Heading>

            <Popover.Root>
              <Popover.Trigger>
                <IconButton variant="ghost">
                  <InfoCircledIcon />
                </IconButton>
              </Popover.Trigger>

              <Popover.Content>
                <Flex gap="1" align="center">
                  <AccessibilityIcon />
                  <Text>{strings.website.tools.tankopedia.crew.info}</Text>
                </Flex>
              </Popover.Content>
            </Popover.Root>
          </Flex>

          <InfoWithDelta value="crewCount" stats={stats} decimals={0} />

          {tank.crew.map((member) => {
            return (
              <Fragment key={member.type}>
                <InfoWithDelta
                  stats={stats}
                  key={`${member.type}-root`}
                  name={`${
                    strings.website.tools.tankopedia.crew[
                      CREW_MEMBER_NAMES[member.type]
                    ]
                  }${
                    member.count > 1
                      ? ` ${literals(strings.common.units.x, [
                          `${member.count}`,
                        ])}`
                      : ''
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
                              index === 0
                                ? strings.website.tools.tankopedia.crew[
                                    CREW_MEMBER_NAMES[sub]
                                  ]
                                : sub,
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
          <Heading size="5">
            {strings.website.tools.tankopedia.maneuverability.title}
          </Heading>
          <Info
            name={strings.website.tools.tankopedia.characteristics.values.speed}
            unit="kph"
          />
          <InfoWithDelta
            value="speedForwards"
            stats={stats}
            decimals={0}
            indent
          />
          <InfoWithDelta
            value="speedBackwards"
            stats={stats}
            decimals={0}
            indent
          />
          <InfoWithDelta stats={stats} decimals={0} value="enginePower" />
          <InfoWithDelta
            stats={stats}
            decimals={1}
            unit="tn"
            deltaType="lowerIsBetter"
            value="weight"
          />
          <Info
            name={
              strings.website.tools.tankopedia.characteristics.values
                .terrain_coefficients
            }
          />
          <InfoWithDelta
            value="hardTerrainCoefficient"
            stats={stats}
            decimals={0}
            unit="%"
            indent
          />
          <InfoWithDelta
            stats={stats}
            decimals={0}
            unit="%"
            indent
            value="mediumTerrainCoefficient"
          />
          <InfoWithDelta
            value="softTerrainCoefficient"
            stats={stats}
            decimals={0}
            unit="%"
            indent
          />
          <Info
            name={
              strings.website.tools.tankopedia.characteristics.values
                .raw_terrain_coefficients
            }
            deltaType="lowerIsBetter"
          />
          <InfoWithDelta
            value="hardTerrainCoefficientRaw"
            stats={stats}
            decimals={2}
            unit="%"
            indent
            deltaType="lowerIsBetter"
          />
          <InfoWithDelta
            stats={stats}
            decimals={2}
            unit="%"
            indent
            deltaType="lowerIsBetter"
            value="mediumTerrainCoefficientRaw"
          />
          <InfoWithDelta
            stats={stats}
            decimals={2}
            unit="%"
            indent
            deltaType="lowerIsBetter"
            value="softTerrainCoefficientRaw"
          />
          <Info
            name={
              strings.website.tools.tankopedia.characteristics.values
                .power_to_weight_ratio
            }
            unit="hp/tn"
          />
          <InfoWithDelta
            stats={stats}
            decimals={1}
            indent
            value="powerToWeightRatioHardTerrain"
          />
          <InfoWithDelta
            stats={stats}
            decimals={1}
            indent
            value="powerToWeightRatioMediumTerrain"
          />
          <InfoWithDelta
            stats={stats}
            decimals={1}
            indent
            value="powerToWeightRatioSoftTerrain"
          />
          <InfoWithDelta
            stats={stats}
            unit="°/s"
            decimals={1}
            value="turretTraverseSpeed"
          />
          <Info
            name={
              strings.website.tools.tankopedia.characteristics.values
                .hull_traverse_speed
            }
            unit="°/s"
          />
          <InfoWithDelta
            stats={stats}
            decimals={1}
            indent
            value="hullTraverseHardTerrain"
          />
          <InfoWithDelta
            stats={stats}
            decimals={1}
            indent
            value="hullTraverseMediumTerrain"
          />
          <InfoWithDelta
            stats={stats}
            decimals={1}
            indent
            value="hullTraverseSoftTerrain"
          />

          <HullTraverseVisualizer stats={stats} />
        </Flex>

        <Flex direction="column" gap="2">
          <Heading size="5">
            {strings.website.tools.tankopedia.survivability.title}
          </Heading>
          <InfoWithDelta value="health" stats={stats} unit="hp" decimals={0} />
          <InfoWithDelta
            stats={stats}
            name={
              strings.website.tools.tankopedia.characteristics.values.fireChance
            }
            unit="%"
            deltaType="lowerIsBetter"
            decimals={0}
            value={(stats) => stats.fireChance * 100}
          />
          <InfoWithDelta
            value="viewRange"
            stats={stats}
            unit="m"
            decimals={0}
          />
          <ViewRangeVisualizer stats={stats} />
          <Info
            name={
              strings.website.tools.tankopedia.characteristics.values.camouflage
            }
            unit="%"
          />
          <InfoWithDelta
            value={(stats) => stats.camouflageStill * 100}
            stats={stats}
            indent
            name={
              strings.website.tools.tankopedia.characteristics.values
                .camouflageStill
            }
            decimals={2}
          />
          <InfoWithDelta
            value={(stats) => stats.camouflageMoving * 100}
            stats={stats}
            indent
            name={
              strings.website.tools.tankopedia.characteristics.values
                .camouflageMoving
            }
            decimals={2}
          />
          <InfoWithDelta
            stats={stats}
            indent
            name={
              strings.website.tools.tankopedia.characteristics.values
                .camouflageShootingStill
            }
            decimals={2}
            value={(stats) => stats.camouflageShootingStill * 100}
          />
          <InfoWithDelta
            stats={stats}
            indent
            name={
              strings.website.tools.tankopedia.characteristics.values
                .camouflageShootingMoving
            }
            decimals={2}
            value={(stats) => stats.camouflageShootingMoving * 100}
          />
          <InfoWithDelta
            stats={stats}
            indent
            name={
              strings.website.tools.tankopedia.characteristics.values
                .camouflageCaughtOnFire
            }
            decimals={2}
            value={(stats) => stats.camouflageCaughtOnFire * 100}
          />
          <InfoWithDelta
            unit="m"
            decimals={0}
            deltaType="lowerIsBetter"
            stats={stats}
            value="width"
          />
          <InfoWithDelta
            unit="m"
            decimals={0}
            deltaType="lowerIsBetter"
            stats={stats}
            value="height"
          />
          <InfoWithDelta
            unit="m"
            decimals={0}
            deltaType="lowerIsBetter"
            stats={stats}
            value="length"
          />
          <InfoWithDelta
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
