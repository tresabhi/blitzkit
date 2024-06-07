import { times } from 'lodash';
import { argv } from 'process';
import { Region, REGIONS } from '../src/constants/regions';
import { requestLimitExceededEvent } from '../src/core/blitz/fetchBlitz';
import { getAccountInfo } from '../src/core/blitz/getAccountInfo';
import { idToRegion, MIN_IDS } from '../src/core/blitz/idToRegion';
import { asset } from '../src/core/blitzkit/asset';
import { commitAssets } from '../src/core/blitzkit/commitAssets';
import { DidsReadStream, DidsWriteStream } from '../src/core/streams/dids';

const RUN_TIME = 1000 * 60 * 60 * 5.5;
const MAX_REQUESTS = 10;
const ACCOUNTS_PER_CALL = 100;
const TERMINATION_THRESHOLD = 1000;

const production = argv.includes('--production');
const startTime = Date.now();
const indexableRegions = [...REGIONS];
const preDiscoveredRaw = await fetch(
  asset('definitions/ids.dids', !production),
).then(async (response) => {
  if (response.status === 200) {
    const buffer = await response.arrayBuffer();
    return new DidsReadStream(buffer).dids();
  }

  return undefined;
});

console.log(`Running in ${production ? 'production' : 'development'} mode`);

if (preDiscoveredRaw === undefined) {
  console.log('No pre-discovered ids found :(');
} else {
  console.log(`Found ${preDiscoveredRaw.length} pre-discovered ids`);
}

const ids: number[] = [...(preDiscoveredRaw ?? [])]; // TODO: re-validate these ids
const regionalIdIndex: Record<Region, number> = {
  asia: ids.find((id) => idToRegion(id) === 'asia') ?? MIN_IDS.asia,
  com: ids.find((id) => idToRegion(id) === 'com') ?? MIN_IDS.com,
  eu: ids.find((id) => idToRegion(id) === 'eu') ?? MIN_IDS.eu,
};
const zeroStreak: Record<Region, number> = { asia: 0, com: 0, eu: 0 };
let regionIndex = 0;
let outOfTimeFlagged = false;

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

let discardAttempts = 0;
requestLimitExceededEvent.on(() => {
  discardAttempts++;
});

const interval = setInterval(async () => {
  if (discardAttempts > 0) return discardAttempts--;

  const region = indexableRegions[regionIndex];
  const idsToVerify = times(
    ACCOUNTS_PER_CALL,
    (index) => regionalIdIndex[region] + index,
  );
  const verified = await verify(region, idsToVerify);

  console.log(`${region.padEnd(4)} ${verified.length.toString().padStart(3)}`);

  if (verified.length === 0) {
    zeroStreak[region]++;

    if (zeroStreak[region] >= TERMINATION_THRESHOLD) {
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
  const content = Buffer.from(didsWriteStream.uint8Array).toString();

  commitAssets(
    'discovered ids',
    [
      {
        content,
        encoding: 'base64',
        path: 'definitions/ids.dids',
      },
    ],
    production,
  );
}
