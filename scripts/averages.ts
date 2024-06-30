import { chunk, times } from 'lodash';
import { argv } from 'process';
import { Region, REGIONS } from '../src/constants/regions';
import { getAccountInfo } from '../src/core/blitz/getAccountInfo';
import getTankStats from '../src/core/blitz/getTankStats';
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
import { encodeToBase64 } from '../src/core/protobuf/encodeToBase64';

interface DataPoint {
  x: number;
  y: number;
  w: number;
}

const MAX_ACTIVITY_TIME = 1000 * 60 * 60 * 24 * 120;
const MIN_BATTLES = 5000;
const RUN_TIME = 1000 * 60 * 60 * 5.9;
const THREADS = 10;
const PLAYER_IDS_PER_CALL = 100;

const startTime = Date.now();
const production = argv.includes('--production');
const preDiscoveredIds = await fetchPreDiscoveredIds(!production);
const playerIds: Record<Region, number[][]> = {
  asia: chunk(
    preDiscoveredIds.filter((id) => idToRegion(id) === 'asia'),
    PLAYER_IDS_PER_CALL,
  ),
  com: chunk(
    preDiscoveredIds.filter((id) => idToRegion(id) === 'com'),
    PLAYER_IDS_PER_CALL,
  ),
  eu: chunk(
    preDiscoveredIds.filter((id) => idToRegion(id) === 'eu'),
    PLAYER_IDS_PER_CALL,
  ),
};
let regionIndex = 0;
let checkedPlayers = 0;
let includedPlayers = 0;
const availableRegions = [...REGIONS];
const tankIds: number[] = [];
const tanksSorted: Record<number, AverageDefinitionsAllStats[]> = {};
let postWorkRequested = false;

times(THREADS, async () => {
  while (availableRegions.length > 0 && startTime + RUN_TIME > Date.now()) {
    const region = availableRegions[regionIndex];
    const regionIds = playerIds[region];
    const [ids] = regionIds.splice(
      Math.floor(Math.random() * regionIds.length),
      1,
    );
    const accountInfo = await getAccountInfo(region, ids, undefined, {
      fields: 'last_battle_time,statistics.all.battles',
    });
    checkedPlayers += ids.length;

    /**
     * Pass rates
     * none: 1000 / 1000
     * activity: 55 / 1000
     * battles: 30 / 1000
     * both: 23 / 1000
     */

    const filteredIds = ids.filter((_, index) => {
      const info = accountInfo[index];
      return (
        info !== null &&
        Date.now() - info.last_battle_time * 1000 <= MAX_ACTIVITY_TIME &&
        info.statistics.all.battles > MIN_BATTLES
      );
    });
    includedPlayers += filteredIds.length;
    const players = await Promise.all(
      filteredIds.map((id) => getTankStats(region, id)),
    );

    players.forEach((tanks) => {
      tanks?.forEach((tank) => {
        if (tank.all.battles === 0) return;

        if (!tankIds.includes(tank.tank_id)) {
          tankIds.push(tank.tank_id);
          tanksSorted[tank.tank_id] = [];
        }

        tanksSorted[tank.tank_id].push({
          ...tank.all,
          battle_life_time: tank.battle_life_time,
        });
      });
    });

    if (regionIds.length === 0 && availableRegions.includes(region)) {
      availableRegions.splice(availableRegions.indexOf(region), 1);
    }
    regionIndex = (regionIndex + 1) % availableRegions.length;
  }

  if (!postWorkRequested) {
    postWorkRequested = true;
    postWork();
  }
});

async function postWork() {
  console.log(
    `Generating statistics based off ${includedPlayers.toLocaleString()} players (${checkedPlayers.toLocaleString()} checked in total) and ${tankIds.length} tanks...`,
  );

  const averages: AverageDefinitions = {};

  tankIds.forEach((id) => {
    const tanks = tanksSorted[id];
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

      if (data.length === 0) return;

      function sum(slicer: (data: DataPoint) => number) {
        return data.reduce(
          (accumulator, data) => accumulator + slicer(data),
          0,
        );
      }

      const sum_w = sum(({ w }) => w);
      const sum_wx = sum(({ w, x }) => w * x);
      const sum_wy = sum(({ w, y }) => w * y);
      const x_bar = sum_wx / sum_w;
      const y_bar = sum_wy / sum_w;
      const mu = x_bar;

      const sigma_numerator = sum(({ w, x }) => w * (x - x_bar) ** 2);
      const sigma = Math.sqrt(sigma_numerator / sum_w);

      const r_numerator = sum(({ w, x, y }) => w * (x - x_bar) * (y - y_bar));
      const r_denominator_x = sum(({ w, x }) => w * (x - x_bar) ** 2);
      const r_denominator_y = sum(({ w, y }) => w * (y - y_bar) ** 2);
      const r = r_numerator / Math.sqrt(r_denominator_x * r_denominator_y);

      entry.mu[key] = mu;
      entry.sigma[key] = sigma;
      entry.r[key] = isNaN(r) ? 0 : r;
    });

    averages[id] = entry as AverageDefinitionsEntry;
  });

  commitAssets(
    'averages',
    [
      {
        path: 'definitions/averages.pb',
        content: await encodeToBase64('blitzkit.AverageDefinitions', {
          averages,
        }),
        encoding: 'base64',
      },
    ],
    production,
  );
}
