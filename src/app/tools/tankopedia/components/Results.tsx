import { Callout, Flex } from '@radix-ui/themes';
import { go } from 'fuzzysort';
import { times } from 'lodash';
import { memo, use, useMemo } from 'react';
import { ExperimentIcon } from '../../../../components/ExperimentIcon';
import { TANK_CLASSES } from '../../../../components/Tanks/components/Item/constants';
import { resolveNearPenetration } from '../../../../core/blitz/resolveNearPenetration';
import { gameDefinitions } from '../../../../core/blitzkit/gameDefinitions';
import { modelDefinitions } from '../../../../core/blitzkit/modelDefinitions';
import { normalizeBoundingBox } from '../../../../core/blitzkit/normalizeBoundingBox';
import { resolveDpm } from '../../../../core/blitzkit/resolveDpm';
import { resolveReload } from '../../../../core/blitzkit/resolveReload';
import {
  TankDefinition,
  tankDefinitions,
  tankNames,
  tanksDefinitionsArray,
} from '../../../../core/blitzkit/tankDefinitions';
import { tankopediaFilterTank } from '../../../../core/blitzkit/tankopediaFilterTank';
import { unionBoundingBox } from '../../../../core/blitzkit/unionBoundingBox';
import { useTankopediaFilters } from '../../../../stores/tankopediaFilters';
import { FilterControl } from './FilterControl';
import { NoResults } from './NoResults';
import { SearchBar } from './SearchBar';
import { SkeletonTankCard } from './SkeletonTankCard';
import { TankCard } from './TankCard';
import { TankCardWrapper } from './TankCardWrapper';
import { treeTypeOrder } from './TankSearch/constants';

export const Results = memo(() => {
  const awaitedGameDefinitions = use(gameDefinitions);
  const awaitedModelDefinitions = use(modelDefinitions);
  const awaitedTankDefinitions = use(tankDefinitions);
  const awaitedTanksDefinitionsArray = use(tanksDefinitionsArray);
  const awaitedTankNames = use(tankNames);
  const filters = useTankopediaFilters();
  const tanks = useMemo(() => {
    if (filters.search === undefined) {
      const filtered = awaitedTanksDefinitionsArray.filter((tank) =>
        tankopediaFilterTank(filters, tank),
      );
      let sorted: TankDefinition[];

      switch (filters.sort.by) {
        case 'meta.none':
          sorted = filtered
            .sort(
              (a, b) =>
                treeTypeOrder.indexOf(b.treeType) -
                treeTypeOrder.indexOf(a.treeType),
            )
            .sort(
              (a, b) =>
                TANK_CLASSES.indexOf(b.class) - TANK_CLASSES.indexOf(a.class),
            )
            .sort(
              (a, b) =>
                awaitedGameDefinitions.nations.indexOf(b.nation) -
                awaitedGameDefinitions.nations.indexOf(a.nation),
            );
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
            (a, b) => a.turrets.at(-1)!.viewRange - b.turrets.at(-1)!.viewRange,
          );
          break;

        case 'survivability.camouflageStill':
          sorted = filtered.sort(
            (a, b) => a.camouflage.still - b.camouflage.still,
          );
          break;

        case 'survivability.camouflageMoving':
          sorted = filtered.sort(
            (a, b) => a.camouflage.moving - b.camouflage.moving,
          );
          break;

        case 'survivability.camouflageShooting':
          sorted = filtered.sort(
            (a, b) =>
              a.camouflage.still *
                a.turrets.at(-1)!.guns.at(-1)!.camouflageLoss -
              b.camouflage.still *
                b.turrets.at(-1)!.guns.at(-1)!.camouflageLoss,
          );
          break;

        case 'survivability.volume':
          sorted = filtered.sort((a, b) => {
            const aTankModelDefinition = awaitedModelDefinitions[a.id];
            const bTankModelDefinition = awaitedModelDefinitions[b.id];
            const aTurretModelDefinition =
              aTankModelDefinition.turrets[a.turrets.at(-1)!.id];
            const bTurretModelDefinition =
              bTankModelDefinition.turrets[b.turrets.at(-1)!.id];
            const aSize = normalizeBoundingBox(
              unionBoundingBox(
                aTankModelDefinition.boundingBox,
                aTurretModelDefinition.boundingBox,
              ),
            );
            const bSize = normalizeBoundingBox(
              unionBoundingBox(
                bTankModelDefinition.boundingBox,
                bTurretModelDefinition.boundingBox,
              ),
            );
            const aVolume = aSize[0] * aSize[1] * aSize[2];
            const bVolume = bSize[0] * bSize[1] * bSize[2];

            return aVolume - bVolume;
          });
          break;

        case 'survivability.length':
          sorted = filtered.sort((a, b) => {
            const aTankModelDefinition = awaitedModelDefinitions[a.id];
            const bTankModelDefinition = awaitedModelDefinitions[b.id];
            const aTurretModelDefinition =
              aTankModelDefinition.turrets[a.turrets.at(-1)!.id];
            const bTurretModelDefinition =
              bTankModelDefinition.turrets[b.turrets.at(-1)!.id];
            const aSize = normalizeBoundingBox(
              unionBoundingBox(
                aTankModelDefinition.boundingBox,
                aTurretModelDefinition.boundingBox,
              ),
            );
            const bSize = normalizeBoundingBox(
              unionBoundingBox(
                bTankModelDefinition.boundingBox,
                bTurretModelDefinition.boundingBox,
              ),
            );
            const aLength = Math.max(aSize[0], aSize[1], aSize[2]);
            const bLength = Math.max(bSize[0], bSize[1], bSize[2]);

            return aLength - bLength;
          });
          break;

        case 'fire.dpm':
          sorted = filtered.sort(
            (a, b) =>
              resolveDpm(
                a.turrets.at(-1)!.guns.at(-1)!,
                a.turrets.at(-1)!.guns.at(-1)!.shells[0],
              ) -
              resolveDpm(
                b.turrets.at(-1)!.guns.at(-1)!,
                b.turrets.at(-1)!.guns.at(-1)!.shells[0],
              ),
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
              a.turrets.at(-1)!.guns.at(-1)!.shells[0].caliber -
              b.turrets.at(-1)!.guns.at(-1)!.shells[0].caliber,
          );
          break;

        case 'fire.standardPenetration':
          sorted = filtered.sort(
            (a, b) =>
              resolveNearPenetration(
                a.turrets.at(-1)!.guns.at(-1)!.shells[0].penetration,
              ) -
              resolveNearPenetration(
                b.turrets.at(-1)!.guns.at(-1)!.shells[0].penetration,
              ),
          );
          break;

        case 'fire.premiumPenetration':
          sorted = filtered.sort(
            (a, b) =>
              resolveNearPenetration(
                a.turrets.at(-1)!.guns.at(-1)!.shells[1]?.penetration ?? 0,
              ) -
              resolveNearPenetration(
                b.turrets.at(-1)!.guns.at(-1)!.shells[1]?.penetration ?? 0,
              ),
          );
          break;

        case 'fire.damage':
          sorted = filtered.sort(
            (a, b) =>
              a.turrets.at(-1)!.guns.at(-1)!.shells[0].damage.armor -
              b.turrets.at(-1)!.guns.at(-1)!.shells[0].damage.armor,
          );
          break;

        case 'fire.shellVelocity':
          sorted = filtered.sort(
            (a, b) =>
              a.turrets.at(-1)!.guns.at(-1)!.shells[0].speed -
              b.turrets.at(-1)!.guns.at(-1)!.shells[0].speed,
          );
          break;

        case 'fire.aimTime':
          sorted = filtered.sort(
            (a, b) =>
              a.turrets.at(-1)!.guns.at(-1)!.aimTime -
              b.turrets.at(-1)!.guns.at(-1)!.aimTime,
          );
          break;

        case 'fire.dispersionStill':
          sorted = filtered.sort(
            (a, b) =>
              a.turrets.at(-1)!.guns.at(-1)!.dispersion.base -
              b.turrets.at(-1)!.guns.at(-1)!.dispersion.base,
          );
          break;

        case 'fire.dispersionMoving':
          sorted = filtered.sort(
            (a, b) =>
              a.tracks.at(-1)!.dispersion.move -
              b.tracks.at(-1)!.dispersion.move,
          );
          break;

        case 'fire.gunDepression':
          sorted = filtered.sort(
            (a, b) =>
              awaitedModelDefinitions[a.id].turrets[a.turrets.at(-1)!.id].guns[
                a.turrets.at(-1)!.guns.at(-1)!.id
              ].pitch.max +
              (awaitedModelDefinitions[a.id].turretRotation?.pitch ?? 0) -
              awaitedModelDefinitions[b.id].turrets[b.turrets.at(-1)!.id].guns[
                b.turrets.at(-1)!.guns.at(-1)!.id
              ].pitch.max -
              (awaitedModelDefinitions[b.id].turretRotation?.pitch ?? 0),
          );
          break;

        case 'fire.gunElevation':
          sorted = filtered.sort(
            (a, b) =>
              awaitedModelDefinitions[b.id].turrets[b.turrets.at(-1)!.id].guns[
                b.turrets.at(-1)!.guns.at(-1)!.id
              ].pitch.min +
              (awaitedModelDefinitions[b.id].turretRotation?.pitch ?? 0) -
              awaitedModelDefinitions[a.id].turrets[a.turrets.at(-1)!.id].guns[
                a.turrets.at(-1)!.guns.at(-1)!.id
              ].pitch.min -
              (awaitedModelDefinitions[a.id].turretRotation?.pitch ?? 0),
          );
          break;

        case 'maneuverability.forwardsSpeed':
          sorted = filtered.sort((a, b) => a.speed.forwards - b.speed.forwards);
          break;

        case 'maneuverability.backwardsSpeed':
          sorted = filtered.sort(
            (a, b) => a.speed.backwards - b.speed.backwards,
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
                  a.turrets.at(-1)!.guns.at(-1)!.weight) -
              b.engines.at(-1)!.power /
                (b.weight +
                  b.engines.at(-1)!.weight +
                  b.tracks.at(-1)!.weight +
                  b.turrets.at(-1)!.weight +
                  b.turrets.at(-1)!.guns.at(-1)!.weight),
          );
          break;

        case 'maneuverability.weight':
          sorted = filtered.sort(
            (a, b) =>
              a.weight +
              a.engines.at(-1)!.weight +
              a.tracks.at(-1)!.weight +
              a.turrets.at(-1)!.weight +
              a.turrets.at(-1)!.guns.at(-1)!.weight -
              (b.weight +
                b.engines.at(-1)!.weight +
                b.tracks.at(-1)!.weight +
                b.turrets.at(-1)!.weight +
                b.turrets.at(-1)!.guns.at(-1)!.weight),
          );
          break;

        case 'maneuverability.traverseSpeed':
          sorted = filtered.sort(
            (a, b) =>
              a.tracks.at(-1)!.traverseSpeed - b.tracks.at(-1)!.traverseSpeed,
          );
          break;
      }

      return filters.sort.direction === 'ascending' ? sorted : sorted.reverse();
    } else {
      const searchedRaw = go(filters.search, awaitedTankNames, {
        key: 'combined',
        limit: 25,
      });
      const searchedTanks = searchedRaw.map(
        (result) => awaitedTankDefinitions[result.obj.id],
      );
      return searchedTanks;
    }
  }, [filters]);

  return (
    <Flex direction="column" gap="4" flexGrow="1">
      <SearchBar topResult={tanks?.[0]} />

      {!filters.search && !filters.searching && <FilterControl />}

      {filters.testing === 'only' && (
        <Flex justify="center" mt="4">
          <Callout.Root color="amber">
            <Callout.Icon>
              <ExperimentIcon style={{ width: '1em', height: '1em' }} />
            </Callout.Icon>
            <Callout.Text>
              Tanks in testing are subject to change and many not represent the
              final product.
            </Callout.Text>
          </Callout.Root>
        </Flex>
      )}

      {!filters.searching && (
        <>
          {tanks.length > 0 && (
            <TankCardWrapper>
              {tanks.map((tank) => (
                <TankCard key={tank.id} tank={tank} />
              ))}
            </TankCardWrapper>
          )}

          {tanks.length === 0 && <NoResults type="search" />}
        </>
      )}

      {filters.searching && (
        <TankCardWrapper>
          {times(Math.round(10 + 10 * Math.random()), (index) => (
            <SkeletonTankCard key={index} />
          ))}
        </TankCardWrapper>
      )}
    </Flex>
  );
});
