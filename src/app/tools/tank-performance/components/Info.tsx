'use client';

import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Callout, Flex } from '@radix-ui/themes';
import { use } from 'react';
import { averageDefinitions } from '../../../../core/blitzkit/averageDefinitions';
import { formatCompact } from '../../../../core/math/formatCompact';
import { useAveragesExclusionRatio } from '../../../../hooks/useAveragesExclusionRatio';

export function Info() {
  const awaitedAverageDefinitions = use(averageDefinitions);
  const ratio = useAveragesExclusionRatio();
  const samples = ratio * awaitedAverageDefinitions.samples.total;
  const minutesAgo = Math.floor(
    (Date.now() - awaitedAverageDefinitions.time) / (1000 * 60),
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
