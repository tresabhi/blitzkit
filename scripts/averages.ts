import { mkdir, writeFile } from 'fs/promises';
import { times } from 'lodash';
import { compress } from 'lz4js';
import { Region, REGIONS } from '../src/constants/regions';
import getTankStats from '../src/core/blitz/getTankStats';
import { idToRegion, MAX_IDS, MIN_IDS } from '../src/core/blitz/idToRegion';
import { asset } from '../src/core/blitzkit/asset';
import { superCompress } from '../src/core/blitzkit/superCompress';
import { DidsReadStream, DidsWriteStream } from '../src/core/streams/dids';
import { IndividualTankStats } from '../src/types/tanksStats';

const RUN_TIME = 1000 * 60;
const MAX_REQUESTS = 10;
const startTime = Date.now();

const list: IndividualTankStats[][] = [];
const preDiscovered = await fetch(asset('averages/discovered.dids.lz4')).then(
  async (response) => {
    return [
      1000000048, 500000058, 500000076, 2000000096, 2000000097, 2000000102,
      2000000103, 2000000109, 1000000116, 500000131, 2000000138, 2000000141,
      2000000140, 2000000143, 2000000144, 2000000145, 500000147, 2000000150,
      2000000173, 2000000174, 2000000178, 2000000177, 2000000182, 2000000189,
      500000191, 2000000191, 2000000192, 2000000196,
    ];

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

  let preDiscoveredIndex = 0;

  async function chainPreDiscovery() {
    processes++;

    if (preDiscoveredIndex >= preDiscovered!.length) {
      processes--;

      if (processes !== 0) return;

      console.log(`Rediscovered ids in ${Date.now() - startTime}ms`);
      discover();

      return;
    }

    const id = preDiscovered![preDiscoveredIndex++];
    const region = idToRegion(id);

    if (id > MAX_IDS[region]) return;

    const stats = await getTankStats(region, id, { felids: 'all' });

    if (stats !== null && stats.length > 0) {
      discoveredIds.push(id);
      list.push(stats);

      console.log(`re-discovered ${id} in ${region}`);
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

  async function chainDiscovery() {
    processes++;

    if (Date.now() - startTime > RUN_TIME) {
      processes--;

      if (processes !== 0) return;

      const discoveredIdsContent = compress(
        new DidsWriteStream().dids(discoveredIds).uint8Array,
      );

      await mkdir('temp/averages', { recursive: true });
      writeFile('temp/averages/discovered.dids.lz4', discoveredIdsContent);
      writeFile('temp/averages/list.cdon.lz4', superCompress(list));

      console.log(
        `Total run time: ${
          Date.now() - startTime
        }ms\nDiscovered ids: ${discoveredIds.length}`,
      );

      return;
    }

    regionIndex = (regionIndex + 1) % REGIONS.length;
    const region = REGIONS[regionIndex];
    const id = index[region]++;

    if (id > MAX_IDS[region]) return;

    const stats = await getTankStats(region, id, { felids: 'all' });

    if (stats !== null && stats.length > 0) {
      discoveredIds.push(id);
      list.push(stats);

      console.log(`discovered ${id} in ${region}`);
    }

    processes--;
    setTimeout(chainDiscovery); // circumvent max call stack
  }

  console.log(`Spawning ${MAX_REQUESTS} discovery chains...`);
  times(MAX_REQUESTS, chainDiscovery);
}
