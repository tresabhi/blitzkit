import { Callout, Flex } from '@radix-ui/themes';
import { go } from 'fuzzysort';
import { range } from 'lodash';
import { memo, use, useMemo } from 'react';
import { ExperimentIcon } from '../../../../components/ExperimentIcon';
import {
  Tier,
  tankDefinitions,
  tankNames,
} from '../../../../core/blitzkit/tankDefinitions';
import { useTankopediaFilters } from '../../../../stores/tankopediaFilters';
import { SearchBar } from './SearchBar';
import { TankCard } from './TankCard';
import { TankCardWrapper } from './TankCardWrapper';
import { TierCard } from './TierCard';

export const Results = memo(() => {
  const awaitedTankDefinitions = use(tankDefinitions);
  const awaitedTankNames = use(tankNames);
  const testing = useTankopediaFilters((state) => state.testing);
  const search = useTankopediaFilters((state) => state.search);
  const searchedTanks = useMemo(() => {
    if (search === undefined) return undefined;

    const searchedRaw = go(search, awaitedTankNames, { key: 'combined' });
    const searchedTanks = searchedRaw.map(
      (result) => awaitedTankDefinitions[result.obj.id],
    );

    return searchedTanks;
  }, [search]);

  return (
    <Flex direction="column" gap="4" flexGrow="1">
      <SearchBar topResult={searchedTanks?.[0]} />

      {testing === 'only' && (
        <Callout.Root color="amber">
          <Callout.Icon>
            <ExperimentIcon style={{ width: '1em', height: '1em' }} />
          </Callout.Icon>
          <Callout.Text>
            Tanks in testing are subject to change and many not represent the
            final product.
          </Callout.Text>
        </Callout.Root>
      )}

      {!search &&
        range(10, 0).map((tier) => <TierCard key={tier} tier={tier as Tier} />)}

      {search && (
        <TankCardWrapper py="4">
          {searchedTanks?.map((tank) => <TankCard key={tank.id} tank={tank} />)}
        </TankCardWrapper>
      )}
    </Flex>
  );
});
