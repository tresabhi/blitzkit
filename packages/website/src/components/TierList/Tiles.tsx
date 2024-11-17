import { fetchTankDefinitions } from '@blitzkit/core';
import { TankCardWrapper } from '../TankSearch/components/TankCardWrapper';
import { TierListTile } from './Tile';

const tankDefinitions = await fetchTankDefinitions();
const tanks = Object.values(tankDefinitions.tanks);

export function TierListTiles() {
  return (
    <TankCardWrapper>
      {tanks.map((tank) => (
        <TierListTile key={tank.id} tank={tank} />
      ))}
    </TankCardWrapper>
  );
}
