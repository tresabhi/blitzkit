'use client';

import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Callout, Flex } from '@radix-ui/themes';
import { use } from 'react';
import { averageDefinitions } from '../../../../core/blitzkit/averageDefinitions';

export function Info() {
  const awaitedAverageDefinitions = use(averageDefinitions);

  return (
    <Flex justify="center">
      <Callout.Root style={{ width: 'fit-content' }}>
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Based on {awaitedAverageDefinitions.players.toLocaleString()} players
          with at least 5,000 career battles and 1 battle in the past 120 days.
          Player counts are less than real values. Updated daily.
        </Callout.Text>
      </Callout.Root>
    </Flex>
  );
}
