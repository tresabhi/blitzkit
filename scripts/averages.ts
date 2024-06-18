import { argv } from 'process';
import { REGIONS, Region } from '../src/constants/regions';
import { retryAbleBlitzFetchEvent } from '../src/core/blitz/fetchBlitz';
import getTankStats from '../src/core/blitz/getTankStats';
import { idToRegion } from '../src/core/blitz/idToRegion';
import {
  AverageDefinitions,
  AverageDefinitionsAllStats,
} from '../src/core/blitzkit/averageDefinitions';
import { averageDefinitionsAllStatsKeys } from '../src/core/blitzkit/averageDefinitions/constants';
import { fetchPreDiscoveredIds } from '../src/core/blitzkit/fetchPreDiscoveredIds';

const MAX_REQUESTS = 10;
const RUN_TIME = 1000 * 20;

const startTime = Date.now();
const production = argv.includes('--production');

console.log(`Running in ${production ? 'production' : 'development'} mode`);

const ids = await fetchPreDiscoveredIds(!production);
const groups: Record<Region, number[]> = { asia: [], com: [], eu: [] };

ids.forEach((id) => {
  groups[idToRegion(id)].push(id);
});

const tankIds: number[] = [];
const tanks: Record<number, AverageDefinitionsAllStats[]> = {};
const indices: Record<Region, number> = {
  asia: groups.asia.length,
  com: groups.com.length,
  eu: groups.eu.length,
};
let players = 0;
let regionIndex = 0;
let discardAttempts = 0;

const interval = setInterval(async () => {
  if (discardAttempts > 0) return discardAttempts--;
  if (Date.now() - startTime > RUN_TIME) post();

  const region = REGIONS[regionIndex];
  const index = --indices[region];
  const id = groups[region][index];
  const stats = await getTankStats(region, id, {
    fields: 'all,battle_life_time,tank_id',
  });

  if (stats !== null) players++;

  stats?.forEach((stat) => {
    if (!tankIds.includes(stat.tank_id)) {
      tanks[stat.tank_id] = [];
      tankIds.push(stat.tank_id);
    }

    // goofy ahh optimization instead of using spread syntax
    const composite = stat.all as AverageDefinitionsAllStats;
    composite.battle_life_time = stat.battle_life_time;

    tanks[stat.tank_id].push(composite);
  });

  regionIndex = (regionIndex + 1) % REGIONS.length;
}, 1000 / MAX_REQUESTS);

retryAbleBlitzFetchEvent.on(() => discardAttempts++);

function post() {
  clearInterval(interval);
  console.log(
    `Out of time, computing ${tankIds.length} tanks from ${players} players...`,
  );

  const averages: AverageDefinitions = {};

  tankIds.forEach((id) => {
    const samples = tanks[id];
    const n = samples.length;

    function sum(slice: (tank: AverageDefinitionsAllStats) => number) {
      return samples.reduce((acc, tank) => {
        return acc + slice(tank);
      }, 0);
    }

    const denominator = sum((tank) => tank.battles);

    function moment(slice: (tank: AverageDefinitionsAllStats) => number) {
      return samples.reduce((acc, tank) => {
        return acc + tank.battles * slice(tank);
      }, 0);
    }

    function weightedAverage(
      slice: (tank: AverageDefinitionsAllStats) => number,
    ) {
      return moment(slice) / denominator;
    }

    const sumBattles = sum((tank) => tank.battles);

    function reduce(method: (key: keyof AverageDefinitionsAllStats) => number) {
      return averageDefinitionsAllStatsKeys.reduce<
        Partial<AverageDefinitionsAllStats>
      >((acc, key) => {
        acc[key] = method(key);
        return acc;
      }, {}) as AverageDefinitionsAllStats;
    }

    const mu = reduce(
      (key) => sum((tank) => tank.battles * tank[key]) / sumBattles,
    );

    // const sigma = averageDefinitionsAllStatsKeys.reduce<
    //   Partial<AverageDefinitionsAllStats>
    // >((acc, key) => {
    //   acc[key] = Math.sqrt(sum((tank) => (tank[key] - mu[key]) ** 2) / n);
    //   return acc;
    // }, {}) as AverageDefinitionsAllStats;
    // const r = averageDefinitionsAllStatsKeys.reduce<
    //   Partial<AverageDefinitionsAllStats>
    // >((acc, key) => {
    //   acc[key] =
    //     (n *
    //       sum(
    //         (tank) => (tank[key] / tank.battles) * (tank.wins / tank.battles),
    //       ) -
    //       sum((tank) => tank[key] / tank.battles) *
    //         sum((tank) => tank.wins / tank.battles)) /
    //     Math.sqrt(
    //       (n * sum((tank) => (tank[key] / tank.battles) ** 2) -
    //         sum((tank) => tank[key] / tank.battles) ** 2) *
    //         (n * sum((tank) => (tank.wins / tank.battles) ** 2) -
    //           sum((tank) => tank.wins / tank.battles) ** 2),
    //     );
    //   return acc;
    // }, {}) as AverageDefinitionsAllStats;

    averages[id] = { n: n, mu, sigma, r };
  });
}
