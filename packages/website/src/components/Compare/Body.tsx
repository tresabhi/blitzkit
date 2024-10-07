import { asset } from '@blitzkit/core';
import { Flex, Heading, IconButton, Table } from '@radix-ui/themes';
import type { TankCharacteristics } from '../../core/blitzkit/tankCharacteristics';
import { CompareEphemeral } from '../../stores/compareEphemeral';
import { StickyColumnHeaderCell } from '../StickyColumnHeaderCell';
import { CompareRow } from './CompareRow';
import { CompareSectionTitle } from './CompareSectionTitle';

interface BodyProps {
  stats: TankCharacteristics[];
}

export function Body({ stats }: BodyProps) {
  const members = CompareEphemeral.use((state) => state.members);
  const hasNonRegularGun = members.some(
    ({ gun }) => gun.gun_type!.$case !== 'regular',
  );
  const mutateCompareEphemeral = CompareEphemeral.useMutation();

  return (
    <>
      <Table.Header>
        <Table.Row>
          <StickyColumnHeaderCell top={137} style={{ left: 0, zIndex: 2 }}>
            <Flex height="100%" align="center">
              <Heading size="4">Firepower</Heading>
            </Flex>
          </StickyColumnHeaderCell>

          {members.map(({ gun, shell, key }, index) => (
            <StickyColumnHeaderCell key={key} top={137}>
              <Flex justify="center">
                <Flex>
                  {gun.gun_type!.value.base.shells.map(
                    (thisShell, shellIndex) => (
                      <IconButton
                        color={thisShell.id === shell.id ? undefined : 'gray'}
                        variant="soft"
                        key={thisShell.id}
                        style={{
                          borderTopLeftRadius: shellIndex === 0 ? undefined : 0,
                          borderBottomLeftRadius:
                            shellIndex === 0 ? undefined : 0,
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
                          mutateCompareEphemeral((draft) => {
                            draft.members[index].shell = thisShell;
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
                    ),
                  )}
                </Flex>
              </Flex>
            </StickyColumnHeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <CompareRow stats={stats} name="DPM" value="dpm" decimals={0} />
        <CompareRow
          stats={stats}
          name="Reload"
          deltaType="lowerIsBetter"
          value={(stats) =>
            stats.shellReload ??
            stats.shellReloads!.reduce((a, b) => a + b, 0) /
              stats.shellReloads!.length
          }
          display={(stats) =>
            stats.shellReload?.toFixed(2) ??
            stats.shellReloads!.map((reload) => reload.toFixed(2)).join(', ')
          }
          deltaNominalDisplay={(delta) => delta.toFixed(2)}
        />
        {hasNonRegularGun && (
          <>
            <CompareRow
              stats={stats}
              name="Intra-clip"
              deltaType="lowerIsBetter"
              value="intraClip"
              decimals={2}
            />
            <CompareRow
              stats={stats}
              name="Shells"
              value="shells"
              decimals={0}
            />
          </>
        )}
        <CompareRow
          stats={stats}
          name="Penetration"
          value="penetration"
          decimals={0}
        />
        <CompareRow stats={stats} name="Damage" value="damage" decimals={0} />
        {hasNonRegularGun && (
          <CompareRow
            stats={stats}
            name="clipping potential"
            indent
            value="clipDamage"
            decimals={0}
          />
        )}
        <CompareRow
          stats={stats}
          name="Module damage"
          value="moduleDamage"
          decimals={0}
        />
        <CompareRow stats={stats} name="Caliber" value="caliber" decimals={0} />
        <CompareRow
          stats={stats}
          name="Normalization"
          value="shellNormalization"
          decimals={0}
        />
        <CompareRow
          stats={stats}
          name="Ricochet"
          value="shellRicochet"
          deltaType="lowerIsBetter"
          decimals={0}
        />
        <CompareRow
          stats={stats}
          name="Shell velocity"
          value="shellVelocity"
          decimals={0}
        />
        <CompareRow
          stats={stats}
          name="Aim time"
          value="aimTime"
          deltaType="lowerIsBetter"
          decimals={2}
        />
        <CompareRow
          stats={stats}
          name="Dispersion"
          value="dispersion"
          deltaType="lowerIsBetter"
          decimals={3}
        />
        <CompareRow
          stats={stats}
          name="moving"
          indent
          value="dispersionMoving"
          deltaType="lowerIsBetter"
          decimals={3}
        />
        <CompareRow
          stats={stats}
          name="hull traversing"
          indent
          value="dispersionHullTraversing"
          deltaType="lowerIsBetter"
          decimals={3}
        />
        <CompareRow
          stats={stats}
          name="turret traversing"
          indent
          value="dispersionTurretTraversing"
          deltaType="lowerIsBetter"
          decimals={3}
        />
        <CompareRow
          stats={stats}
          name="shooting"
          indent
          value="dispersionShooting"
          deltaType="lowerIsBetter"
          decimals={3}
        />
        <CompareRow
          stats={stats}
          name="gun damaged"
          indent
          value="dispersionGunDamaged"
          deltaType="lowerIsBetter"
          decimals={3}
        />
        <CompareRow
          stats={stats}
          name="maximum"
          indent
          value="maxDispersion"
          deltaType="lowerIsBetter"
          decimals={3}
        />
        <CompareRow
          stats={stats}
          name="Gun depression"
          value="gunDepression"
          decimals={1}
        />
        <CompareRow
          stats={stats}
          name="elevation"
          indent
          value="gunElevation"
          decimals={1}
        />
      </Table.Body>

      <CompareSectionTitle>Maneuverability</CompareSectionTitle>
      <Table.Body>
        <CompareRow
          stats={stats}
          name="Speed forwards"
          value="speedForwards"
          decimals={0}
        />
        <CompareRow
          stats={stats}
          name="backwards"
          indent
          value="speedBackwards"
          decimals={0}
        />
        <CompareRow
          stats={stats}
          name="Engine power"
          value="enginePower"
          decimals={0}
        />
        <CompareRow stats={stats} name="Weight" value="weight" decimals={1} />
        <CompareRow
          stats={stats}
          name="Terrain coefficient"
          value="hardTerrainCoefficient"
          decimals={0}
        />
        <CompareRow
          stats={stats}
          name="medium terrain"
          indent
          value="mediumTerrainCoefficient"
          decimals={0}
        />
        <CompareRow
          stats={stats}
          name="soft terrain"
          indent
          value="softTerrainCoefficient"
          decimals={0}
        />
        <CompareRow
          stats={stats}
          name="Raw terrain coefficient"
          value="hardTerrainCoefficientRaw"
          decimals={2}
        />
        <CompareRow
          stats={stats}
          name="medium terrain"
          indent
          value="mediumTerrainCoefficientRaw"
          decimals={2}
        />
        <CompareRow
          stats={stats}
          name="soft terrain"
          indent
          value="softTerrainCoefficientRaw"
          decimals={2}
        />
        <CompareRow
          stats={stats}
          name="Power to weight ratio"
          value="powerToWeightRatioHardTerrain"
          decimals={1}
        />
        <CompareRow
          stats={stats}
          name="medium terrain"
          indent
          value="powerToWeightRatioMediumTerrain"
          decimals={1}
        />
        <CompareRow
          stats={stats}
          name="soft terrain"
          indent
          value="powerToWeightRatioSoftTerrain"
          decimals={1}
        />
        <CompareRow
          stats={stats}
          name="Turret traverse speed"
          value="turretTraverseSpeed"
          decimals={1}
        />
        <CompareRow
          stats={stats}
          name="Traverse speed"
          value="hullTraverseHardTerrain"
          decimals={1}
        />
        <CompareRow
          stats={stats}
          name="medium terrain"
          indent
          value="hullTraverseMediumTerrain"
          decimals={1}
        />
        <CompareRow
          stats={stats}
          name="soft terrain"
          indent
          value="hullTraverseSoftTerrain"
          decimals={1}
        />
      </Table.Body>

      <CompareSectionTitle>Survivability</CompareSectionTitle>
      <Table.Body>
        <CompareRow stats={stats} name="Health" value="health" decimals={0} />
        <CompareRow
          stats={stats}
          name="Fire chance"
          value="fireChance"
          deltaType="lowerIsBetter"
          display={(stats) => (stats.fireChance * 100).toFixed(0)}
          deltaNominalDisplay={(delta) => (delta * 100).toFixed(0)}
        />
        <CompareRow
          stats={stats}
          name="View range"
          value="viewRange"
          decimals={0}
        />
        <CompareRow
          stats={stats}
          name="Camouflage"
          value="camouflageStill"
          display={(stats) => (stats.camouflageStill * 100).toFixed(0)}
          deltaNominalDisplay={(delta) => (delta * 100).toFixed(0)}
        />
        <CompareRow
          stats={stats}
          name="moving"
          indent
          value="camouflageMoving"
          display={(stats) => (stats.camouflageMoving * 100).toFixed(0)}
          deltaNominalDisplay={(delta) => (delta * 100).toFixed(0)}
        />
        <CompareRow
          stats={stats}
          name="shooting"
          indent
          value="camouflageShootingStill"
          display={(stats) => (stats.camouflageShootingStill * 100).toFixed(0)}
          deltaNominalDisplay={(delta) => (delta * 100).toFixed(0)}
        />
        <CompareRow
          stats={stats}
          name="shooting & moving"
          indent
          value="camouflageShootingMoving"
          display={(stats) => (stats.camouflageShootingMoving * 100).toFixed(0)}
          deltaNominalDisplay={(delta) => (delta * 100).toFixed(0)}
        />
        <CompareRow
          stats={stats}
          name="caught on fire"
          indent
          value="camouflageCaughtOnFire"
          display={(stats) => (stats.camouflageCaughtOnFire * 100).toFixed(0)}
          deltaNominalDisplay={(delta) => (delta * 100).toFixed(0)}
        />
        <CompareRow
          stats={stats}
          name="Volume"
          value="volume"
          deltaType="lowerIsBetter"
          decimals={1}
        />
        <CompareRow
          stats={stats}
          name="width"
          indent
          value="width"
          deltaType="lowerIsBetter"
          decimals={1}
        />
        <CompareRow
          stats={stats}
          name="height"
          indent
          value="height"
          deltaType="lowerIsBetter"
          decimals={1}
        />
        <CompareRow
          stats={stats}
          name="length"
          indent
          value="length"
          deltaType="lowerIsBetter"
          decimals={1}
        />
      </Table.Body>
    </>
  );
}
