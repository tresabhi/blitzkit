import { times } from 'lodash';
import { argv } from 'process';
import { Region, REGIONS } from '../src/constants/regions';
import { blitzFetchQueueAvailableEvent } from '../src/core/blitz/fetchBlitz';
import { idToRegion } from '../src/core/blitz/idToRegion';
import {
  AverageDefinitions,
  AverageDefinitionsAllStats,
  AverageDefinitionsEntry,
  AverageDefinitionsEntrySubPartial,
} from '../src/core/blitzkit/averageDefinitions';
import { averageDefinitionsAllStatsKeys } from '../src/core/blitzkit/averageDefinitions/constants';
import { commitAssets } from '../src/core/blitzkit/commitAssets';
import { fetchPreDiscoveredIds } from '../src/core/blitzkit/fetchPreDiscoveredIds';
import { superCompress } from '../src/core/blitzkit/superCompress';

interface DataPoint {
  x: number;
  y: number;
  w: number;
}

const RUN_TIME = 1000 * 60 * 60;
const MAX_REQUESTS = 10;

const production = argv.includes('--production');
const preDiscoveredIds = await fetchPreDiscoveredIds(!production);
const playerIds: Record<Region, number[]> = {
  asia: preDiscoveredIds.filter((id) => idToRegion(id) === 'asia'),
  com: preDiscoveredIds.filter((id) => idToRegion(id) === 'com'),
  eu: preDiscoveredIds.filter((id) => idToRegion(id) === 'eu'),
};
const regionalIndices: Record<Region, number> = {
  asia: playerIds.asia.length - 1,
  com: playerIds.com.length - 1,
  eu: playerIds.eu.length - 1,
};
let regionIndex = 0;
const availableRegions = [...REGIONS];

times(MAX_REQUESTS, () => {
  validate();
  blitzFetchQueueAvailableEvent.on(validate);
});

function validate() {
  const region = availableRegions[regionIndex];

  regionIndex = (regionIndex + 1) % availableRegions.length;
}

function postWork() {
  const tankIds: number[] = [];
  const sorted: Record<number, AverageDefinitionsAllStats[]> = {};

  console.log('Sorting tanks...');

  players.forEach((tanks) => {
    tanks.forEach((tank) => {
      if (tank.all.battles === 0) return;

      if (!tankIds.includes(tank.tank_id)) {
        tankIds.push(tank.tank_id);
        sorted[tank.tank_id] = [];
      }

      sorted[tank.tank_id].push({
        ...tank.all,
        battle_life_time: tank.battle_life_time,
      });
    });
  });

  console.log(
    `Generating statistics based off ${players.length} players and ${tankIds.length} tanks...`,
  );

  const averages: AverageDefinitions = {};

  tankIds.forEach((id) => {
    const tanks = sorted[id];
    const samples = tanks.length;
    const entry: AverageDefinitionsEntrySubPartial = {
      samples,
      mu: {},
      sigma: {},
      r: {},
    };

    averageDefinitionsAllStatsKeys.forEach((key) => {
      const data: DataPoint[] = tanks.map((tank) => ({
        w: tank.battles,
        x: tank[key] / tank.battles,
        y: tank.wins / tank.battles,
      }));

      function sum(slicer: (data: DataPoint) => number) {
        return data.reduce(
          (accumulator, data) => accumulator + slicer(data),
          0,
        );
      }

      const sum_w = sum(({ w }) => w);
      const sum_wx = sum(({ w, x }) => w * x);
      const sum_wy = sum(({ w, y }) => w * y);
      const mu_x = sum_wx / sum_w;
      const mu_y = sum_wy / sum_w;
      const mu = mu_x;

      const sigma_numerator = sum(({ w, x }) => w * (x - mu_x) ** 2);
      const sigma = Math.sqrt(sigma_numerator / sum_w);

      const r_numerator = sum(({ w, x, y }) => w * (x - mu_x) * (y - mu_y));
      const r_denominator_x = sum(({ w, x }) => w * (x - mu_x) ** 2);
      const r_denominator_y = sum(({ w, y }) => w * (y - mu_y) ** 2);
      const r = r_numerator / Math.sqrt(r_denominator_x * r_denominator_y);

      entry.mu[key] = mu;
      entry.sigma[key] = sigma;
      entry.r[key] = r;
    });

    averages[id] = entry as AverageDefinitionsEntry;
  });

  commitAssets(
    'averages',
    [
      {
        path: 'definitions/averages.cdon.lz4',
        content: superCompress(averages),
        encoding: 'base64',
      },
    ],
    production,
  );
}
