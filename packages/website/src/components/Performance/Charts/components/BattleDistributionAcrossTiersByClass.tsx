import {
  TANK_CLASSES,
  TIERS,
  TIER_ROMAN_NUMERALS,
  fetchAverageDefinitions,
  fetchTankDefinitions,
} from '@blitzkit/core';
import strings from '@blitzkit/core/lang/en-US.json';
import { TankPerformanceEphemeral } from '../../../../stores/tankPerformanceEphemeral';
import { EChart } from '../../../EChart';

const averageDefinitions = await fetchAverageDefinitions();
const tankDefinitions = await fetchTankDefinitions();
const averageDefinitionsArray = Object.entries(averageDefinitions.averages);

export function BattleDistributionAcrossTiersByClass() {
  const playerCountPeriod = TankPerformanceEphemeral.use(
    (state) => state.playerCountPeriod,
  );

  return (
    <EChart
      height="25rem"
      title="Battle distribution across tiers by class"
      option={{
        xAxis: {
          type: 'category',
          data: TIERS.map((tier) => TIER_ROMAN_NUMERALS[tier]),
        },
        yAxis: {
          type: 'value',
        },
        legend: {
          data: TANK_CLASSES.map((c) => strings.common.tank_class_short[c]),
        },
        series: TANK_CLASSES.map((c) => ({
          name: strings.common.tank_class_short[c],
          data: TIERS.map((tier) => {
            return averageDefinitionsArray.reduce(
              (accumulator, [idString, entry]) => {
                const id = Number(idString);
                const tank = tankDefinitions.tanks[id];

                if (
                  tank === undefined ||
                  tank.tier !== tier ||
                  tank.class !== c
                ) {
                  return accumulator;
                }

                return (
                  accumulator +
                  entry.mu.battles * entry.samples[playerCountPeriod]
                );
              },
              0,
            );
          }),
          type: 'bar',
        })),
      }}
    />
  );
}
