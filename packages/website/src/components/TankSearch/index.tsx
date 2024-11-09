import {
  TANK_CLASSES,
  fetchGameDefinitions,
  fetchModelDefinitions,
  fetchTankDefinitions,
  fetchTankNames,
  normalizeBoundingBox,
  resolveDpm,
  unionBoundingBox,
  type TankDefinition,
} from '@blitzkit/core';
import { useStore } from '@nanostores/react';
import { Callout, Flex, Link, Text, type FlexProps } from '@radix-ui/themes';
import fuzzysort from 'fuzzysort';
import { times } from 'lodash-es';
import { memo, useEffect, useMemo, useState } from 'react';
import { filterTank } from '../../core/blitzkit/filterTank';
import { resolveReload } from '../../core/blitzkit/resolveReload';
import { $tankFilters } from '../../stores/tankFilters';
import {
  SORT_NAMES,
  SORT_UNITS,
} from '../../stores/tankopediaPersistent/constants';
import { $tankopediaSort } from '../../stores/tankopediaSort';
import { ExperimentIcon } from '../ExperimentIcon';
import { FilterControl } from './components/FilterControl';
import { NoResults } from './components/NoResults';
import { SearchBar } from './components/SearchBar';
import { SkeletonTankCard } from './components/SkeletonTankCard';
import { TankCard } from './components/TankCard';
import { TankCardWrapper } from './components/TankCardWrapper';
import { treeTypeOrder } from './constants';

type TankSearchProps = Omit<FlexProps, 'onSelect'> & {
  compact?: boolean;
  onSelect?: (tank: TankDefinition) => void;
  onSelectAll?: (tanks: TankDefinition[]) => void;
};

const PREVIEW_COUNT = 25;
const DEFAULT_LOADED_CARDS = 75;

const gameDefinitions = await fetchGameDefinitions();
const modelDefinitions = await fetchModelDefinitions();
const tankDefinitions = await fetchTankDefinitions();
const tankNames = await fetchTankNames();

export const TankSearch = memo<TankSearchProps>(
  ({ compact, onSelect, onSelectAll, ...props }) => {
    const awaitedTanksDefinitionsArray = Object.values(tankDefinitions.tanks);
    const tankFilters = useStore($tankFilters);
    const tankopediaSort = useStore($tankopediaSort);

    const tanksFiltered = useMemo(() => {
      if (tankFilters.search === undefined) {
        const filtered = awaitedTanksDefinitionsArray.filter((tank) =>
          filterTank(tankFilters, tank),
        );
        let sorted: TankDefinition[];

        switch (tankopediaSort.by) {
          case 'meta.none':
            sorted = filtered
              .sort((a, b) => b.tier - a.tier)
              .sort(
                (a, b) =>
                  treeTypeOrder.indexOf(b.type) - treeTypeOrder.indexOf(a.type),
              )
              .sort(
                (a, b) =>
                  TANK_CLASSES.indexOf(b.class) - TANK_CLASSES.indexOf(a.class),
              )
              .sort(
                (a, b) =>
                  gameDefinitions.nations.indexOf(b.nation) -
                  gameDefinitions.nations.indexOf(a.nation),
              )
              .sort((a, b) => a.tier - b.tier);
            break;

          case 'survivability.health': {
            sorted = filtered.sort((a, b) => {
              const aHealth = a.health + a.turrets.at(-1)!.health;
              const bHealth = b.health + b.turrets.at(-1)!.health;

              return aHealth - bHealth;
            });
            break;
          }

          case 'survivability.viewRange':
            sorted = filtered.sort(
              (a, b) =>
                a.turrets.at(-1)!.view_range - b.turrets.at(-1)!.view_range,
            );
            break;

          case 'survivability.camouflageStill':
            sorted = filtered.sort(
              (a, b) => a.camouflage_still - b.camouflage_still,
            );
            break;

          case 'survivability.camouflageMoving':
            sorted = filtered.sort(
              (a, b) => a.camouflage_moving - b.camouflage_moving,
            );
            break;

          case 'survivability.camouflageShooting':
            sorted = filtered.sort(
              (a, b) =>
                a.camouflage_still *
                  a.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base
                    .camouflage_loss -
                b.camouflage_still *
                  b.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base
                    .camouflage_loss,
            );
            break;

          case 'survivability.volume':
            sorted = filtered.sort((a, b) => {
              const aTankModelDefinition = modelDefinitions.models[a.id];
              const bTankModelDefinition = modelDefinitions.models[b.id];
              const aTurretModelDefinition =
                aTankModelDefinition.turrets[a.turrets.at(-1)!.id];
              const bTurretModelDefinition =
                bTankModelDefinition.turrets[b.turrets.at(-1)!.id];
              const aSize = normalizeBoundingBox(
                unionBoundingBox(
                  aTankModelDefinition.bounding_box,
                  aTurretModelDefinition.bounding_box,
                ),
              );
              const bSize = normalizeBoundingBox(
                unionBoundingBox(
                  bTankModelDefinition.bounding_box,
                  bTurretModelDefinition.bounding_box,
                ),
              );
              const aVolume = aSize.x * aSize.y * aSize.z;
              const bVolume = bSize.x * bSize.y * bSize.z;

              return aVolume - bVolume;
            });
            break;

          case 'survivability.length':
            sorted = filtered.sort((a, b) => {
              const aTankModelDefinition = modelDefinitions.models[a.id];
              const bTankModelDefinition = modelDefinitions.models[b.id];
              const aTurretModelDefinition =
                aTankModelDefinition.turrets[a.turrets.at(-1)!.id];
              const bTurretModelDefinition =
                bTankModelDefinition.turrets[b.turrets.at(-1)!.id];
              const aSize = normalizeBoundingBox(
                unionBoundingBox(
                  aTankModelDefinition.bounding_box,
                  aTurretModelDefinition.bounding_box,
                ),
              );
              const bSize = normalizeBoundingBox(
                unionBoundingBox(
                  bTankModelDefinition.bounding_box,
                  bTurretModelDefinition.bounding_box,
                ),
              );
              const aLength = Math.max(aSize.x, aSize.y, aSize.z);
              const bLength = Math.max(bSize.x, bSize.y, bSize.z);

              return aLength - bLength;
            });
            break;

          case 'fire.dpm':
            sorted = filtered.sort(
              (a, b) =>
                resolveDpm(
                  a.turrets.at(-1)!.guns.at(-1)!,
                  a.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[0],
                ) -
                resolveDpm(
                  b.turrets.at(-1)!.guns.at(-1)!,
                  b.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[0],
                ),
            );
            break;

          case 'fire.dpmPremium':
            sorted = filtered.sort(
              (a, b) =>
                (a.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[1]
                  ? resolveDpm(
                      a.turrets.at(-1)!.guns.at(-1)!,
                      a.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base
                        .shells[1],
                    )
                  : 0) -
                (b.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[1]
                  ? resolveDpm(
                      b.turrets.at(-1)!.guns.at(-1)!,
                      b.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base
                        .shells[1],
                    )
                  : 0),
            );
            break;

          case 'fire.reload':
            sorted = filtered.sort(
              (a, b) =>
                resolveReload(a.turrets.at(-1)!.guns.at(-1)!) -
                resolveReload(b.turrets.at(-1)!.guns.at(-1)!),
            );
            break;

          case 'fire.caliber':
            sorted = filtered.sort(
              (a, b) =>
                a.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[0]
                  .caliber -
                b.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[0]
                  .caliber,
            );
            break;

          case 'fire.standardPenetration':
            sorted = filtered.sort(
              (a, b) =>
                a.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[0]
                  .penetration.near -
                b.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[0]
                  .penetration.near,
            );
            break;

          case 'fire.premiumPenetration':
            sorted = filtered.sort(
              (a, b) =>
                (a.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[1]
                  ?.penetration.near ?? 0) -
                (b.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[1]
                  ?.penetration.near ?? 0),
            );
            break;

          case 'fire.damage':
            sorted = filtered.sort(
              (a, b) =>
                a.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[0]
                  .armor_damage -
                b.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[0]
                  .armor_damage,
            );
            break;

          case 'fire.shellVelocity':
            sorted = filtered.sort(
              (a, b) =>
                a.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[0]
                  .velocity -
                b.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[0]
                  .velocity,
            );
            break;

          case 'fire.shellRange':
            sorted = filtered.sort(
              (a, b) =>
                a.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[0]
                  .range -
                b.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[0]
                  .range,
            );
            break;

          case 'fire.aimTime':
            sorted = filtered.sort(
              (a, b) =>
                a.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.aim_time -
                b.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.aim_time,
            );
            break;

          case 'fire.dispersionStill':
            sorted = filtered.sort(
              (a, b) =>
                a.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base
                  .dispersion_base -
                b.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base
                  .dispersion_base,
            );
            break;

          case 'fire.dispersionMoving':
            sorted = filtered.sort(
              (a, b) =>
                a.tracks.at(-1)!.dispersion_move -
                b.tracks.at(-1)!.dispersion_move,
            );
            break;

          case 'fire.gunDepression':
            sorted = filtered.sort(
              (a, b) =>
                modelDefinitions.models[a.id].turrets[a.turrets.at(-1)!.id]
                  .guns[a.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.id]
                  .pitch.max +
                (modelDefinitions.models[a.id].initial_turret_rotation?.pitch ??
                  0) -
                modelDefinitions.models[b.id].turrets[b.turrets.at(-1)!.id]
                  .guns[b.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.id]
                  .pitch.max -
                (modelDefinitions.models[b.id].initial_turret_rotation?.pitch ??
                  0),
            );
            break;

          case 'fire.gunElevation':
            sorted = filtered.sort(
              (a, b) =>
                modelDefinitions.models[b.id].turrets[b.turrets.at(-1)!.id]
                  .guns[b.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.id]
                  .pitch.min +
                (modelDefinitions.models[b.id].initial_turret_rotation?.pitch ??
                  0) -
                modelDefinitions.models[a.id].turrets[a.turrets.at(-1)!.id]
                  .guns[a.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.id]
                  .pitch.min -
                (modelDefinitions.models[a.id].initial_turret_rotation?.pitch ??
                  0),
            );
            break;

          case 'maneuverability.forwardsSpeed':
            sorted = filtered.sort(
              (a, b) => a.speed_forwards - b.speed_forwards,
            );
            break;

          case 'maneuverability.backwardsSpeed':
            sorted = filtered.sort(
              (a, b) => a.speed_backwards - b.speed_backwards,
            );
            break;

          case 'maneuverability.power':
            sorted = filtered.sort(
              (a, b) => a.engines.at(-1)!.power - b.engines.at(-1)!.power,
            );
            break;

          case 'maneuverability.powerToWeight':
            sorted = filtered.sort(
              (a, b) =>
                a.engines.at(-1)!.power /
                  (a.weight +
                    a.engines.at(-1)!.weight +
                    a.tracks.at(-1)!.weight +
                    a.turrets.at(-1)!.weight +
                    a.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base
                      .weight) -
                b.engines.at(-1)!.power /
                  (b.weight +
                    b.engines.at(-1)!.weight +
                    b.tracks.at(-1)!.weight +
                    b.turrets.at(-1)!.weight +
                    b.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.weight),
            );
            break;

          case 'maneuverability.weight':
            sorted = filtered.sort(
              (a, b) =>
                a.weight +
                a.engines.at(-1)!.weight +
                a.tracks.at(-1)!.weight +
                a.turrets.at(-1)!.weight +
                a.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.weight -
                (b.weight +
                  b.engines.at(-1)!.weight +
                  b.tracks.at(-1)!.weight +
                  b.turrets.at(-1)!.weight +
                  b.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.weight),
            );
            break;

          case 'maneuverability.traverseSpeed':
            sorted = filtered.sort(
              (a, b) =>
                a.tracks.at(-1)!.traverse_speed -
                b.tracks.at(-1)!.traverse_speed,
            );
            break;
        }

        return tankopediaSort.direction === 'ascending'
          ? sorted
          : sorted.reverse();
      } else {
        const searchedRaw = fuzzysort.go(tankFilters.search, tankNames, {
          keys: ['searchableName', 'searchableNameDeburr', 'camouflages'],
        });
        const searchedTanks = searchedRaw.map(
          (result) => tankDefinitions.tanks[result.obj.id],
        );
        return searchedTanks;
      }
    }, [tankFilters, tankopediaSort]);
    const [loadedRows, setLoadedRows] = useState(DEFAULT_LOADED_CARDS);
    const tanks = tanksFiltered.slice(0, loadedRows);

    useEffect(() => {
      setLoadedRows(DEFAULT_LOADED_CARDS);
    }, [tankFilters, tankopediaSort]);

    return (
      <Flex direction="column" gap="4" flexGrow="1" {...props}>
        <SearchBar topResult={tanks?.[0]} onSelect={onSelect} />

        {!tankFilters.search && !tankFilters.searching && (
          <FilterControl compact={compact} />
        )}

        <Flex mt="2" gap="1" align="center" justify="center" direction="column">
          <Flex gap="2">
            <Text color="gray">
              {tanksFiltered.length} tank
              {tanksFiltered.length === 1 ? '' : 's'}
            </Text>

            {onSelectAll && (
              <Link
                underline="always"
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  onSelectAll(tanksFiltered);
                }}
              >
                Select all
              </Link>
            )}
          </Flex>

          {tankopediaSort.by !== 'meta.none' && (
            <Text color="gray">
              Sorting by {SORT_NAMES[tankopediaSort.by]}
              {SORT_UNITS[tankopediaSort.by] === undefined
                ? ''
                : ` (${SORT_UNITS[tankopediaSort.by]})`}
              , {tankopediaSort.direction}
            </Text>
          )}
        </Flex>

        {tankFilters.testing === 'only' && (
          <Flex justify="center" mt="4">
            <Callout.Root color="amber">
              <Callout.Icon>
                <ExperimentIcon style={{ width: '1em', height: '1em' }} />
              </Callout.Icon>
              <Callout.Text>
                Tanks in testing are subject to change and may not represent the
                final product.
              </Callout.Text>
            </Callout.Root>
          </Flex>
        )}

        {!tankFilters.searching && (
          <>
            {tanks.length > 0 && (
              <TankCardWrapper>
                {tanks.map((tank) => (
                  <TankCard key={tank.id} onSelect={onSelect} tank={tank} />
                ))}

                {times(
                  Math.min(PREVIEW_COUNT, tanksFiltered.length - loadedRows),
                  (index) => {
                    return (
                      <SkeletonTankCard
                        key={index}
                        onIntersection={() => {
                          setLoadedRows((state) =>
                            Math.min(state + 2, tanksFiltered.length),
                          );
                        }}
                      />
                    );
                  },
                )}
              </TankCardWrapper>
            )}

            {tanks.length === 0 && <NoResults type="search" />}
          </>
        )}

        {tankFilters.searching && (
          <TankCardWrapper>
            {times(Math.round(10 + 10 * Math.random()), (index) => (
              <SkeletonTankCard key={index} />
            ))}
          </TankCardWrapper>
        )}
      </Flex>
    );
  },
);
