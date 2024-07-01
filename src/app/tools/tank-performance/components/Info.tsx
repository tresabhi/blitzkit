'use client';

import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Callout, Flex } from '@radix-ui/themes';
import { use, useMemo } from 'react';
import { averageDefinitionsArray } from '../../../../core/blitzkit/averageDefinitions';

export function Info() {
  const awaitedAverageDefinitionsArray = use(averageDefinitionsArray);
  const samples = useMemo(
    () => awaitedAverageDefinitionsArray.reduce((a, b) => a + b.samples, 0),
    [],
  );

  return (
    <Flex justify="center">
      <Callout.Root style={{ width: 'fit-content' }}>
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Based on {samples.toLocaleString()} players with at least 5,000 career
          battles and 1 battle in the past 120 days. Stats displayed as an
          average per battle. Updated daily.
        </Callout.Text>
      </Callout.Root>
    </Flex>
  );
}
