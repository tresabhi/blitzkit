import {
  fetchAverageDefinitions,
  fetchDiscoveredIdsDefinitions,
  formatCompact,
} from '@blitzkit/core';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Callout, Flex } from '@radix-ui/themes';

const discoveredIdsDefinitions = await fetchDiscoveredIdsDefinitions();
const averageDefinitions = await fetchAverageDefinitions();

export function Info() {
  const samples = discoveredIdsDefinitions.count;
  const minutesAgo = Math.floor(
    (Date.now() - averageDefinitions.time) / (1000 * 60),
  );
  const hoursAgo = Math.floor(minutesAgo / 60);

  return (
    <Flex justify="center">
      <Callout.Root style={{ width: 'fit-content' }}>
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Career stats based on {formatCompact(Math.round(samples))} players.
          Updated {hoursAgo === 0 ? minutesAgo : hoursAgo}{' '}
          {hoursAgo === 0 ? 'minutes' : 'hours'} ago.
        </Callout.Text>
      </Callout.Root>
    </Flex>
  );
}
