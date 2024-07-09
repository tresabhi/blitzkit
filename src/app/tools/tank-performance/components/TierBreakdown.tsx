'use client';

import { ResponsiveBar } from '@nivo/bar';
import { Box, Flex, Heading } from '@radix-ui/themes';
import { times } from 'lodash';
import { use } from 'react';
import { TankClass } from '../../../../components/Tanks';
import { TANK_CLASSES } from '../../../../components/Tanks/components/Item/constants';
import { averageDefinitionsArray } from '../../../../core/blitzkit/averageDefinitions';
import {
  tankDefinitions,
  Tier,
} from '../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../core/blitzkit/tankDefinitions/constants';
import { nivoTheme } from '../../../../core/nivo/theme';
import strings from '../../../../lang/en-US.json';

export function TierBreakdown() {
  const awaitedAverageDefinitionsArray = use(averageDefinitionsArray);
  const awaitedTankDefinitions = use(tankDefinitions);
  const numberFormat = Intl.NumberFormat(undefined, { notation: 'compact' });

  return (
    <Flex justify="center" py="6">
      <Flex direction="column" flexGrow="1" gap="4" maxWidth="640px">
        <Heading ml="2" size="4">
          Players (30d) per tier
        </Heading>

        <Box height="320px" width="100%">
          <ResponsiveBar
            {...nivoTheme}
            data={times(10, (index) => {
              const tier = (index + 1) as Tier;
              const tierTanks = awaitedAverageDefinitionsArray.filter(
                ({ id }) => awaitedTankDefinitions[id].tier === tier,
              );
              const populations: Record<TankClass, number> = {
                'AT-SPG': 0,
                heavyTank: 0,
                lightTank: 0,
                mediumTank: 0,
              };

              tierTanks.forEach((stats) => {
                const tank = awaitedTankDefinitions[stats.id];
                populations[tank.class] +=
                  stats.mu.battles * stats.samples.d_30;
              });

              TANK_CLASSES.forEach((tankClass) => {
                populations[tankClass] = Math.round(populations[tankClass]);
              });

              return { tier: TIER_ROMAN_NUMERALS[tier], ...populations };
            })}
            keys={[...TANK_CLASSES].reverse()}
            indexBy="tier"
            colors={{ scheme: 'dark2' }}
            label={(d) => numberFormat.format(d.value as number)}
            margin={{ right: 96, bottom: 20, left: 40 }}
            legendLabel={(d) =>
              strings.common.tank_class_short[d.id as TankClass]
            }
            axisLeft={{
              tickSize: 0,
              format: (value) => numberFormat.format(value as number),
            }}
            axisBottom={{ tickSize: 0 }}
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                translateX: 120,
                itemsSpacing: 4,
                itemWidth: 100,
                itemHeight: 20,
              },
            ]}
          />
        </Box>
      </Flex>
    </Flex>
  );
}
