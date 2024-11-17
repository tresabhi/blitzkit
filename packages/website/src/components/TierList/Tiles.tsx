import { fetchTankDefinitions } from '@blitzkit/core';
import { TankCard } from '../TankCard';
import { TankCardWrapper } from '../TankSearch/components/TankCardWrapper';

const tankDefinitions = await fetchTankDefinitions();
const tanks = Object.values(tankDefinitions.tanks);

export function TierListTiles() {
  return (
    <TankCardWrapper>
      {tanks.map((tank) => (
        <TankCard tank={tank} />
      ))}
    </TankCardWrapper>
  );
}
