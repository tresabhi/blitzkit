import { times } from 'lodash';
import { compress } from 'lz4js';
import { argv } from 'process';
import ProgressBar from 'progress';
import { Region, REGIONS } from '../src/constants/regions';
import getTankStats from '../src/core/blitz/getTankStats';
import { idToRegion, MAX_IDS, MIN_IDS } from '../src/core/blitz/idToRegion';
import { asset } from '../src/core/blitzkit/asset';
import {
  AverageDefinitions,
  AverageDefinitionsAllStats,
} from '../src/core/blitzkit/averageDefinitions';
import { averageDefinitionsAllStatsKeys } from '../src/core/blitzkit/averageDefinitions/constants';
import { commitAssets } from '../src/core/blitzkit/commitAssets';
import { superCompress } from '../src/core/blitzkit/superCompress';
import { DidsReadStream, DidsWriteStream } from '../src/core/streams/dids';
import { IndividualTankStats } from '../src/types/tanksStats';

interface DataPoint {
  x: number;
  y: number;
  w: number;
}

const RUN_TIME = 1000 * 60 * 60;
const MAX_REQUESTS = 10;

const production = argv.includes('--production');
const startTime = Date.now();
const fields = 'all,tank_id,battle_life_time';

const players: IndividualTankStats[][] = [];
const preDiscovered = await fetch(asset('averages/discovered.dids.lz4')).then(
  async (response) => {
    if (response.status === 200) {
      const buffer = await response.arrayBuffer();
      return new DidsReadStream(buffer).dids();
    }

    return undefined;
  },
);
const discoveredIds: number[] = [];
let processes = 0;

if (preDiscovered) {
  console.log(
    `Revalidating ${preDiscovered.length} pre-discovered ids with ${MAX_REQUESTS} chains...`,
  );

  const preDiscoveredBar = new ProgressBar(':bar', {
    total: preDiscovered.length,
  });
  let preDiscoveredIndex = 0;

  async function chainPreDiscovery() {
    processes++;

    if (preDiscoveredIndex === preDiscovered!.length) {
      processes--;

      if (processes !== 0) return;

      console.log(
        `Rediscovered ${discoveredIds.length} / ${preDiscovered!.length} ids in ${Date.now() - startTime}ms`,
      );
      discover();

      return;
    }

    const id = preDiscovered![preDiscoveredIndex++];
    const region = idToRegion(id);

    if (id > MAX_IDS[region]) return;

    const stats = await getTankStats(region, id, { fields });

    if (stats !== null && stats.length > 0) {
      discoveredIds.push(id);
      players.push(stats);
      preDiscoveredBar.tick();
    }

    processes--;
    setTimeout(chainPreDiscovery); // circumvent max call stack
  }

  times(MAX_REQUESTS, chainPreDiscovery);
} else {
  console.log('No pre-discovered ids found :(');
  discover();
}

function discover() {
  const index: Record<Region, number> = {
    asia:
      preDiscovered?.find((id) => idToRegion(id) === 'asia') ?? MIN_IDS.asia,
    com: preDiscovered?.find((id) => idToRegion(id) === 'com') ?? MIN_IDS.com,
    eu: preDiscovered?.find((id) => idToRegion(id) === 'eu') ?? MIN_IDS.eu,
  };

  let regionIndex = 0;
  let done = 0;

  async function chainDiscovery() {
    regionIndex = (regionIndex + 1) % REGIONS.length;
    const region = REGIONS[regionIndex];
    const id = index[region]++;

    if (Date.now() - startTime > RUN_TIME || id === MAX_IDS[region]) {
      if (++done !== MAX_REQUESTS) return;

      console.log(
        `Total discovery run time: ${
          Date.now() - startTime
        }ms\nDiscovered ids: ${discoveredIds.length}`,
      );

      postWork();

      return;
    }

    if (id > MAX_IDS[region]) return;

    const stats = await getTankStats(region, id, { fields });

    if (stats !== null && stats.length > 0) {
      discoveredIds.push(id);
      players.push(stats);

      console.log(
        `discovered ${id} in ${region} (time left: ${RUN_TIME - (Date.now() - startTime)}ms)`,
      );
    }

    setTimeout(chainDiscovery); // circumvent max call stack
  }

  console.log(`Spawning ${MAX_REQUESTS} discovery chains...`);
  times(MAX_REQUESTS, chainDiscovery);
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
      const x_w = sum_wx / sum_w;
      const y_w = sum_wy / sum_w;
      const r_numerator = sum(({ w, x, y }) => w * (x - x_w) * (y - y_w));
      const r_denominator_x = sum(({ w, x }) => w * (x - x_w) ** 2);
      const r_denominator_y = sum(({ w, y }) => w * (y - y_w) ** 2);

      const r = r_numerator / Math.sqrt(r_denominator_x * r_denominator_y);
      const mu = x_w;
    });
  });

  commitAssets(
    'averages',
    [
      {
        path: 'definitions/averages.cdon.lz4',
        content: superCompress(averages),
        encoding: 'base64',
      },
      {
        path: 'definitions/discovered.dids.lz4',
        content: Buffer.from(
          compress(new DidsWriteStream().dids(discoveredIds).uint8Array),
        ).toString('base64'),
        encoding: 'base64',
      },
    ],
    production,
  );
}
