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
  const samples = ratio * awaitedAverageDefinitions.samples.d_120;

  return (
    <Flex justify="center">
      <Callout.Root style={{ width: 'fit-content' }}>
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Career stats based on {formatCompact(Math.round(samples))} players
          with at least 5K career battles and 1 battle in the past 120 days.
          Updated{' '}
          {Math.floor(
            (Date.now() - awaitedAverageDefinitions.time) / (1000 * 60 * 60),
          )}{' '}
          hours ago.
        </Callout.Text>
      </Callout.Root>
    </Flex>
  );
}
