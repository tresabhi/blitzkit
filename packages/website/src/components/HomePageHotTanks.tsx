import { fetchAverageDefinitions, fetchTankDefinitions } from '@blitzkit/core';
import { Box, Flex, Heading } from '@radix-ui/themes';
import { TankopediaPersistent } from '../stores/tankopediaPersistent';
import { TankCard } from './TankSearch/components/TankCard';

const tankDefinitions = await fetchTankDefinitions();
const averageDefinitions = await fetchAverageDefinitions();
const tanks = Object.values(tankDefinitions.tanks);
const tankAverages = Object.entries(averageDefinitions.averages).map(
  ([id, average]) => ({
    id: Number(id),
    ...average,
  }),
);

// lol don't ask questions
const testTanks = tanks
  .filter((tank) => tank.testing && tank.tier >= 8)
  .sort((a, b) => b.tier - a.tier);
const mostPlayedTanks = tankAverages
  .sort((a, b) => b.samples.d_1 - a.samples.d_1)
  .map(({ id }) => tankDefinitions.tanks[id])
  .filter((tank) => tank !== undefined && !tank.testing);
const popularTanks = [...testTanks, ...mostPlayedTanks].slice(0, 8);

export function HomePageHotTanks() {
  return (
    <TankopediaPersistent.Provider>
      <Content />
    </TankopediaPersistent.Provider>
  );
}

function Content() {
  return (
    <Flex direction="column" gap="5" pt="4" pb="8">
      <Heading align="center" size="5">
        Popular tanks
      </Heading>

      <Flex justify="center" gap="4" wrap="wrap">
        {popularTanks.map((tank) => (
          <Box width="7rem">
            <TankCard tank={tank} />
          </Box>
        ))}
      </Flex>
    </Flex>
  );
}
