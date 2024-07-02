'use client';

import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Callout, Flex } from '@radix-ui/themes';
import { use } from 'react';
import { averageDefinitions } from '../../../../core/blitzkit/averageDefinitions';
import { discoveredIdsDefinitions } from '../../../../core/blitzkit/discoveredIdDefinitions';

export function Info() {
  const awaitedAverageDefinitions = use(averageDefinitions);
  const awaitedDiscoveredIdsDefinitions = use(discoveredIdsDefinitions);
  const numberFormat = Intl.NumberFormat(undefined, { notation: 'compact' });
  const ratio =
    awaitedDiscoveredIdsDefinitions.count /
    awaitedAverageDefinitions.scanned_players;

  return (
    <Flex justify="center">
      <Callout.Root style={{ width: 'fit-content' }}>
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Career stats based on{' '}
          {numberFormat.format(
            Math.round(ratio * awaitedAverageDefinitions.sampled_players),
          )}{' '}
          players with at least 5K career battles and 1 battle in the past 30
          days. Updated daily.
        </Callout.Text>
      </Callout.Root>
    </Flex>
  );
}
