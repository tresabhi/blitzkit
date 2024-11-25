import {
  fetchGameDefinitions,
  fetchTankDefinitions,
  metaSortTank,
} from '@blitzkit/core';
import { useStore } from '@nanostores/react';
import { useMemo } from 'react';
import { filterTank } from '../../core/blitzkit/filterTank';
import { $tankFilters } from '../../stores/tankFilters';
import { TankCardWrapper } from '../TankSearch/components/TankCardWrapper';
import { TierListTile } from './Tile';

const tankDefinitions = await fetchTankDefinitions();
const gameDefinitions = await fetchGameDefinitions();
const tanks = Object.values(tankDefinitions.tanks);

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

  return (
    <TankCardWrapper>
      {sorted.map((tank) => (
        <TierListTile key={tank.id} tank={tank} />
      ))}
    </TankCardWrapper>
  );
}
