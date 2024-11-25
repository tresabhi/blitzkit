import {
  fetchGameDefinitions,
  fetchTankDefinitions,
  metaSortTank,
} from '@blitzkit/core';
import { useStore } from '@nanostores/react';
import { times } from 'lodash-es';
import { useMemo, useState } from 'react';
import { filterTank } from '../../core/blitzkit/filterTank';
import { $tankFilters } from '../../stores/tankFilters';
import { SkeletonTankCard } from '../TankSearch/components/SkeletonTankCard';
import { TankCardWrapper } from '../TankSearch/components/TankCardWrapper';
import { TierListTile } from './Tile';

const tankDefinitions = await fetchTankDefinitions();
const gameDefinitions = await fetchGameDefinitions();
const tanks = Object.values(tankDefinitions.tanks);

const PREVIEW_COUNT = 32;
const DEFAULT_LOADED_CARDS = 75;

export function TierListTiles() {
  const filters = useStore($tankFilters);
  const sorted = useMemo(
    () =>
      metaSortTank(
        tanks.filter((tank) => filterTank(filters, tank)),
        gameDefinitions,
      ).reverse(),
    [filters],
  );
  const [loadedTiles, setLoadedTiles] = useState(DEFAULT_LOADED_CARDS);

  return (
    <TankCardWrapper>
      {sorted.slice(0, loadedTiles).map((tank) => (
        <TierListTile key={tank.id} tank={tank} />
      ))}

      {times(Math.min(PREVIEW_COUNT, sorted.length - loadedTiles), (index) => {
        return (
          <SkeletonTankCard
            key={index}
            onIntersection={() => {
              setLoadedTiles((state) => Math.min(state + 2, sorted.length));
            }}
          />
        );
      })}
    </TankCardWrapper>
  );
}
