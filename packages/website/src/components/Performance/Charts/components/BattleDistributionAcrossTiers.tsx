import {
  fetchAverageDefinitions,
  fetchTankDefinitions,
  formatCompact,
  TANK_CLASSES,
  TankClass,
  TIER_ROMAN_NUMERALS,
  TIERS,
} from '@blitzkit/core';
import strings from '@blitzkit/core/lang/en-US.json';
import { useStore } from '@nanostores/react';
import { Box, Flex, Heading } from '@radix-ui/themes';
import { filterTank } from '../../../../core/blitzkit/filterTank';
import { useAveragesExclusionRatio } from '../../../../hooks/useAveragesExclusionRatio';
import { $tankFilters } from '../../../../stores/tankFilters';
import { TankPerformanceEphemeral } from '../../../../stores/tankPerformanceEphemeral';
import { ThemedBar } from '../../../Nivo/ThemedBar';

const averageDefinitions = await fetchAverageDefinitions();
const tankDefinitions = await fetchTankDefinitions();
const averageDefinitionsArray = Object.entries(averageDefinitions.averages);

export function BattleDistributionAcrossTiers() {
  const playerCountPeriod = TankPerformanceEphemeral.use(
    (state) => state.playerCountPeriod,
  );
  const ratio = useAveragesExclusionRatio();
  const filters = useStore($tankFilters);

  return (
    <Flex direction="column" gap="4">
      <Heading align="center">Players by tier & class</Heading>
      <Box height="25rem">
        <ThemedBar
          data={TIERS.map((tier) => {
            const players: Record<TankClass, number> = {
              0: 0,
              1: 0,
              2: 0,
              3: 0,
            };

            averageDefinitionsArray.forEach(([idString, entry]) => {
              const id = Number(idString);
              const tank = tankDefinitions.tanks[id];

              if (
                tank === undefined ||
                tank.tier !== tier ||
                !filterTank(filters, tank)
              ) {
                return;
              }

              players[tank.class] += entry.samples[playerCountPeriod] * ratio;
            });

            const bar: Record<string, number | string> = {
              tier: TIER_ROMAN_NUMERALS[tier],
            };

            TANK_CLASSES.forEach((c) => {
              bar[strings.common.tank_class_short[c]] = players[c];
            });

            return bar;
          })}
          keys={TANK_CLASSES.map((c) => strings.common.tank_class_short[c])}
          indexBy="tier"
          margin={{ right: 90, bottom: 50, left: 90 }}
          axisBottom={{
            legend: 'Tier',
            legendPosition: 'middle',
            legendOffset: 32,
          }}
          axisLeft={{
            legend: 'Players',
            legendPosition: 'middle',
            legendOffset: -60,
            format: formatCompact,
          }}
          legends={[
            {
              dataFrom: 'keys',
              anchor: 'bottom-right',
              direction: 'column',
              translateX: 120,
              itemWidth: 100,
              itemHeight: 20,
            },
          ]}
          valueFormat={formatCompact}
        />
      </Box>
    </Flex>
  );
}
