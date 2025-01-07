import { formatCompact } from '@blitzkit/core';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Callout, Flex } from '@radix-ui/themes';
import { awaitableAverageDefinitions } from '../../core/awaitables/averageDefinitions';
import { awaitableDiscoveredIdsDefinitions } from '../../core/awaitables/discoveredIdsDefinitions';
import { literals } from '../../core/i18n/literals';
import { useLocale } from '../../hooks/useLocale';
import type { MaybeSkeletonComponentProps } from '../../types/maybeSkeletonComponentProps';

const [discoveredIdsDefinitions, averageDefinitions] = await Promise.all([
  awaitableDiscoveredIdsDefinitions,
  awaitableAverageDefinitions,
]);

export function PerformanceInfo({ skeleton }: MaybeSkeletonComponentProps) {
  const { strings, locale } = useLocale();
  const samples = formatCompact(
    locale,
    Math.round(discoveredIdsDefinitions.count),
  );
  const minutesAgo = Math.floor(
    (Date.now() - averageDefinitions.time) / (1000 * 60),
  );
  const hoursAgo = Math.floor(minutesAgo / 60);
  const timeAgo = literals(
    strings.website.tools.performance.estimation[
      hoursAgo === 0 ? 'minutes' : 'hours'
    ],
    [`${hoursAgo === 0 ? minutesAgo : hoursAgo}`],
  );

  return (
    <Flex justify="center">
      <Callout.Root style={{ width: 'fit-content' }}>
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          {/* Estimated stats based on{' '}
          {skeleton ? <InlineSkeleton width="2rem" /> : samples} players.
          Updated {skeleton ? <InlineSkeleton width="3rem" /> : timeAgo} ago. */}

          {literals(strings.website.tools.performance.estimation.body, [
            samples,
            timeAgo,
          ])}
        </Callout.Text>
      </Callout.Root>
    </Flex>
  );
}
