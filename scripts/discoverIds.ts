import { times } from 'lodash';
import { argv } from 'process';
import { Region, REGIONS } from '../src/constants/regions';
import { getAccountInfo } from '../src/core/blitz/getAccountInfo';
import { idToRegion, MIN_IDS } from '../src/core/blitz/idToRegion';
import { asset } from '../src/core/blitzkit/asset';
import { DidsReadStream, DidsWriteStream } from '../src/core/streams/dids';

// const RUN_TIME = 1000 * 60 * 60 * 5;
const RUN_TIME = 1000 * 5;
const MAX_REQUESTS = 10;
const ACCOUNTS_PER_CALL = 100;
const REMOVE_REGION_THRESHOLD = 10;

const production = argv.includes('--production');
const startTime = Date.now();

async function verify(region: Region, ids: number[]) {
  const infos = await getAccountInfo(region, ids, undefined, {
    // cheeky way of requesting nothing
    fields: 'account_id,-account_id',
  });
  const filtered = ids.filter((_, index) => {
    const info = infos[index];
    return info !== null;
  });

  return filtered;
}

const indexableRegions = [...REGIONS];
const ids: number[] = [];

const preDiscoveredRaw = await fetch(
  asset('averages/discovered.dids.lz4', !production),
).then(async (response) => {
  if (response.status === 200) {
    const buffer = await response.arrayBuffer();
    return new DidsReadStream(buffer).dids();
  }

  return undefined;
});

const regionalIdIndex: Record<Region, number> = {
  asia:
    preDiscoveredRaw?.find((id) => idToRegion(id) === 'asia') ?? MIN_IDS.asia,
  com: preDiscoveredRaw?.find((id) => idToRegion(id) === 'com') ?? MIN_IDS.com,
  eu: preDiscoveredRaw?.find((id) => idToRegion(id) === 'eu') ?? MIN_IDS.eu,
};
const zeroStreak: Record<Region, number> = { asia: 0, com: 0, eu: 0 };
let regionIndex = 0;
let outOfTimeFlagged = false;

const interval = setInterval(async () => {
  const region = indexableRegions[regionIndex];
  const idsToVerify = times(
    ACCOUNTS_PER_CALL,
    (index) => regionalIdIndex[region] + index,
  );
  const verified = await verify(region, idsToVerify);

  if (verified.length === 0) {
    zeroStreak[region]++;

    if (zeroStreak[region] >= REMOVE_REGION_THRESHOLD) {
      const sliceableIndex = indexableRegions.indexOf(region);

      if (sliceableIndex !== -1) {
        console.log(`Stopped discovery for ${region}`);
        indexableRegions.splice(sliceableIndex, 1);

        if (indexableRegions.length === 0) {
          console.log('All players discovered exhaustively!');
          post();
        }
      }
    }
  } else {
    console.log(
      `${region.padEnd(4)} ${verified.length.toString().padStart(3)}`,
    );

    zeroStreak[region] = 0;
    ids.push(...verified);
  }

  if (Date.now() - startTime > RUN_TIME && !outOfTimeFlagged) {
    outOfTimeFlagged = true;
    console.log('Out of time');
    post();
  }

  regionIndex = (regionIndex + 1) % indexableRegions.length;
  regionalIdIndex[region] += ACCOUNTS_PER_CALL;
}, 1000 / MAX_REQUESTS);

function post() {
  clearInterval(interval);
  console.log(`Uploading ${ids.length} ids...`);

  const didsWriteStream = new DidsWriteStream().dids(ids);

  console.log(didsWriteStream.uint8Array.length);
}
