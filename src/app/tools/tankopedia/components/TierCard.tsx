import { memo, use, useMemo } from 'react';
import { TANK_CLASSES } from '../../../../components/Tanks/components/Item/constants';
import { gameDefinitions } from '../../../../core/blitzkit/gameDefinitions';
import {
  Tier,
  tanksDefinitionsArray,
} from '../../../../core/blitzkit/tankDefinitions';
import { tankopediaFilterTank } from '../../../../core/blitzkit/tankopediaFilterTank';
import { useTankopediaFilters } from '../../../../stores/tankopediaFilters';
import { NoResults } from './NoResults';
import { TankCard } from './TankCard';
import { TankCardWrapper } from './TankCardWrapper';
import { treeTypeOrder } from './TankSearch/constants';

interface TierCardProps {
  tier: Tier;
}

export const TierCard = memo(
  ({ tier }: TierCardProps) => {
    const awaitedGameDefinitions = use(gameDefinitions);
    const awaitedTanksDefinitionsArray = use(tanksDefinitionsArray);
    const filters = useTankopediaFilters();
    const tanks = useMemo(
      () =>
        awaitedTanksDefinitionsArray
          .filter((tank) => tankopediaFilterTank(filters, tank))
          .sort(
            (a, b) =>
              treeTypeOrder.indexOf(a.treeType) -
              treeTypeOrder.indexOf(b.treeType),
          )
          .sort(
            (a, b) =>
              TANK_CLASSES.indexOf(a.class) - TANK_CLASSES.indexOf(b.class),
          )
          .sort(
            (a, b) =>
              awaitedGameDefinitions.nations.indexOf(a.nation) -
              awaitedGameDefinitions.nations.indexOf(b.nation),
          ),
      [tier, filters],
    );

    if (tanks.length === 0) return <NoResults />;

    return (
      <TankCardWrapper>
        {tanks.map((tank) => (
          <TankCard key={tank.id} tank={tank} />
        ))}
      </TankCardWrapper>
    );
  },
  (prev, next) => prev.tier === next.tier,
);
