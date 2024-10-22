import {
  TIERS,
  TIER_ROMAN_NUMERALS,
  fetchAverageDefinitions,
  fetchTankDefinitions,
} from '@blitzkit/core';
import { TankPerformanceEphemeral } from '../../../../stores/tankPerformanceEphemeral';
import { EChart } from '../../../EChart';

const averageDefinitions = await fetchAverageDefinitions();
const tankDefinitions = await fetchTankDefinitions();
const averageDefinitionsArray = Object.entries(averageDefinitions.averages);

export function BattleDistributionAcrossTiers() {
  const playerCountPeriod = TankPerformanceEphemeral.use(
    (state) => state.playerCountPeriod,
  );

  return (
    <EChart
      height="25rem"
      title="Battle distribution across tiers"
      option={{
        xAxis: {
          type: 'category',
          data: TIERS.map((tier) => TIER_ROMAN_NUMERALS[tier]),
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: TIERS.map((tier) => {
              return averageDefinitionsArray.reduce(
                (accumulator, [idString, entry]) => {
                  const id = Number(idString);
                  const tank = tankDefinitions.tanks[id];

                  if (tank === undefined || tank.tier !== tier) {
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
          },
        ],
      }}
    />
  );
}
