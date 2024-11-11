import { fetchTankDefinitions } from '@blitzkit/core';
import { Flex, Separator, Text } from '@radix-ui/themes';
import { TankopediaPersistent } from '../../../stores/tankopediaPersistent';
import { TankCard } from './TankCard';
import { TankCardWrapper } from './TankCardWrapper';

const tankDefinitions = await fetchTankDefinitions();

export function RecentlyViewed() {
  const tankopediaPersistentStore = TankopediaPersistent.useStore();
  // non-reactive because it is a little weird that it updates instantly even before the page loads
  const recentlyViewed = tankopediaPersistentStore.getState().recentlyViewed;

  if (recentlyViewed.length === 0) return null;

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
