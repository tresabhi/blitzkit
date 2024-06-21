import { Callout, Flex } from '@radix-ui/themes';
import { range } from 'lodash';
import { memo, use } from 'react';
import { ExperimentIcon } from '../../../../components/ExperimentIcon';
import { TANK_CLASSES } from '../../../../components/Tanks/components/Item/constants';
import { gameDefinitions } from '../../../../core/blitzkit/gameDefinitions';
import {
  Tier,
  tanksDefinitionsArray,
} from '../../../../core/blitzkit/tankDefinitions';
import { useTankopediaFilters } from '../../../../stores/tankopediaFilters';
import { treeTypeOrder } from './TankSearch/constants';
import { TierCard } from './TierCard';

export const Results = memo(() => {
  const tanks = use(tanksDefinitionsArray);
  const awaitedGameDefinitions = use(gameDefinitions);
  const testing = useTankopediaFilters((state) => state.testing);

  return (
    <Flex direction="column" gap="8" flexGrow="1">
      {testing === 'only' && (
        <Callout.Root color="amber" style={{ width: 'fit-content' }}>
          <Callout.Icon>
            <ExperimentIcon style={{ width: '1em', height: '1em' }} />
          </Callout.Icon>
          <Callout.Text>
            Tanks in testing are subject to change and many not represent the
            final product.
          </Callout.Text>
        </Callout.Root>
      )}

      {range(10, 0).map((tierUntyped) => {
        const tier = tierUntyped as Tier;
        const tierTanks = tanks
          .filter((tank) => tank.tier === tier)
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
          );

        return <TierCard tanks={tierTanks} key={tier} tier={tier} />;
      })}
    </Flex>
  );
});
