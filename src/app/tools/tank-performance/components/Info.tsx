'use client';

import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Callout, Flex } from '@radix-ui/themes';
import { use } from 'react';
import { averageDefinitions } from '../../../../core/blitzkit/averageDefinitions';
import { useAveragesExclusionRatio } from '../../../../hooks/useAveragesExclusionRatio';

export function Info() {
  const awaitedAverageDefinitions = use(averageDefinitions);
  const numberFormat = Intl.NumberFormat(undefined, { notation: 'compact' });
  const ratio = useAveragesExclusionRatio();
  const samples = ratio * awaitedAverageDefinitions.samples.d_120;

  return (
    <Flex justify="center">
      <Callout.Root style={{ width: 'fit-content' }}>
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Career stats based on {numberFormat.format(Math.round(samples))}{' '}
          players with at least 5K career battles and 1 battle in the past 120
          days; updated daily.
        </Callout.Text>
      </Callout.Root>
    </Flex>
  );
}
