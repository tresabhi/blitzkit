import { asset, AverageDefinitions } from '@blitzkit/core';
import { Box, Flex, Heading, Text } from '@radix-ui/themes';
import { range } from 'lodash-es';
import { useAveragesExclusionRatio } from '../../hooks/useAveragesExclusionRatio';
import { Duel } from '../../stores/duel';
import { FIRST_AVERAGES_ENTRY } from '../Charts/constants';
import { ThemedLine } from '../Nivo/ThemedLine';

const currentEntry = Math.floor(Date.now() / 1000 / 60 / 60 / 24);
const days = await Promise.all(
  range(FIRST_AVERAGES_ENTRY, currentEntry).map(async (day) => {
    const url = asset(`averages/${day}.pb`);
    const response = await fetch(url);

    if (response.status !== 200) return null;

    const buffer = await response.arrayBuffer();
    const averageDefinitions = AverageDefinitions.decode(
      new Uint8Array(buffer),
    );

    return { day, definitions: averageDefinitions };
  }),
).then((days) => days.filter((day) => day !== null));

export function TankopediaCharts() {
  const id = Duel.use((state) => state.protagonist.tank.id);
  const ratio = useAveragesExclusionRatio();
  const data = days.map(({ day, definitions }) => {
    const entry = definitions.averages[id];
    const x = new Date(day * 24 * 60 * 60 * 1000);
    const y = entry ? Math.round((entry.samples.d_7 / 7) * ratio) : 0;

    return { x, y };
  });

  return (
    <Flex direction="column" align="center">
      <Flex direction="column" width="50rem">
        <Heading>Players</Heading>
        <Text color="gray" mb="5">
          7-day rolling average
        </Text>

        <Box height="25rem">
          <ThemedLine
            enablePoints={false}
            enableGridX={false}
            data={[{ id: 'value', data }]}
            xFormat={(date) => {
              return (date as Date).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
            }}
            xScale={{ type: 'time' }}
          />
        </Box>
      </Flex>
    </Flex>
  );
}
