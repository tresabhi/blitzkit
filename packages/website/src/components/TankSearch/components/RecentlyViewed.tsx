import { fetchTankDefinitions } from '@blitzkit/core';
import { useStore } from '@nanostores/react';
import { Flex, Separator, Text } from '@radix-ui/themes';
import { isEqual } from 'lodash-es';
import { useMemo } from 'react';
import { $tankFilters, initialTankFilters } from '../../../stores/tankFilters';
import { TankopediaPersistent } from '../../../stores/tankopediaPersistent';
import { $tankopediaSort } from '../../../stores/tankopediaSort';
import { TankCard } from './TankCard';
import { TankCardWrapper } from './TankCardWrapper';

const tankDefinitions = await fetchTankDefinitions();

export function RecentlyViewed() {
  const tankopediaPersistentStore = TankopediaPersistent.useStore();
  const filters = useStore($tankFilters);
  // non-reactive because it is a little weird that it updates instantly even before the page loads
  const recentlyViewed = tankopediaPersistentStore.getState().recentlyViewed;
  const sort = useStore($tankopediaSort);
  const hasFilters = useMemo(
    () =>
      Object.entries(filters).some(([key, value]) => {
        return !isEqual(
          value,
          initialTankFilters[key as keyof typeof initialTankFilters],
        );
      }),
    [filters],
  );

  if (recentlyViewed.length === 0 || sort.by !== 'meta.none' || hasFilters) {
    return null;
  }

  return (
    <Flex direction="column" gap="2" mt="2" mb="6">
      <Text color="gray" align="center">
        Recently viewed
      </Text>
      <TankCardWrapper>
        {recentlyViewed.map((id) => (
          <TankCard tank={tankDefinitions.tanks[id]} key={id} />
        ))}
      </TankCardWrapper>

      <Separator size="4" />
    </Flex>
  );
}
