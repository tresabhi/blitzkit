import { formatCompact } from '@blitzkit/core';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Callout, Flex } from '@radix-ui/themes';
import { awaitableAverageDefinitions } from '../../core/awaitables/averageDefinitions';
import { awaitableDiscoveredIdsDefinitions } from '../../core/awaitables/discoveredIdsDefinitions';
import type { MaybeSkeletonComponentProps } from '../../types/maybeSkeletonComponentProps';
import { InlineSkeleton } from '../InlineSkeleton';

const [discoveredIdsDefinitions, averageDefinitions] = await Promise.all([
  awaitableDiscoveredIdsDefinitions,
  awaitableAverageDefinitions,
]);

export function PerformanceInfo({ skeleton }: MaybeSkeletonComponentProps) {
  const samples = formatCompact(Math.round(discoveredIdsDefinitions.count));
  const minutesAgo = Math.floor(
    (Date.now() - averageDefinitions.time) / (1000 * 60),
  );
  const hoursAgo = Math.floor(minutesAgo / 60);
  const timeAgo = `${hoursAgo === 0 ? minutesAgo : hoursAgo} ${
    hoursAgo === 0 ? 'minutes' : 'hours'
  }`;

  return (
    <Flex justify="center">
      <Callout.Root style={{ width: 'fit-content' }}>
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Estimated stats based on{' '}
          {skeleton ? <InlineSkeleton width="2rem" /> : samples} players.
          Updated {skeleton ? <InlineSkeleton width="3rem" /> : timeAgo} ago.
        </Callout.Text>
      </Callout.Root>
    </Flex>
  );
}
