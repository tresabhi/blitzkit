import { fetchTankDefinitions } from '@blitzkit/core';
import { useStore } from '@nanostores/react';
import { filterTank } from '../../core/blitzkit/filterTank';
import { $tankFilters } from '../../stores/tankFilters';
import { TankCardWrapper } from '../TankSearch/components/TankCardWrapper';
import { TierListTile } from './Tile';

const tankDefinitions = await fetchTankDefinitions();
const tanks = Object.values(tankDefinitions.tanks);

export function TierListTiles() {
  const filters = useStore($tankFilters);

  return (
    <TankCardWrapper>
      {tanks
        .filter((tank) => filterTank(filters, tank))
        .map((tank) => (
          <TierListTile key={tank.id} tank={tank} />
        ))}
    </TankCardWrapper>
  );
}
