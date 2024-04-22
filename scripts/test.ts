import { chunk, times } from 'lodash';
import { compress } from 'lz4js';
import { argv } from 'process';
import { Region, REGIONS } from '../src/constants/regions';
import getTankStats from '../src/core/blitz/getTankStats';
import { idToRegion } from '../src/core/blitz/idToRegion';
import { commitAssets } from '../src/core/blitzrinth/commitAssets';
import { FileChange } from '../src/core/blitzrinth/commitMultipleFiles';
import {
  RtscWritePlayer,
  RtscWriteStream,
  RtsmWriteStream,
} from '../src/core/streams/rts';
import usersRaw from '../test.users.json';

const PLAYERS_PER_CHUNK = 256;
const CHUNKS_PER_BATCH = 128;

const production = argv.includes('--production');
const region = argv
  .find((argument) => argument.startsWith('--region'))
  ?.split('=')[1] as Region | undefined;

if (!region || !REGIONS.includes(region)) {
  throw new Error('No valid region specified');
}

const today = new Date();
const todayPath = `${today.getUTCFullYear()}/${today.getUTCMonth() + 1}/${today.getUTCDate()}`;
const users = usersRaw.filter(({ blitz }) => idToRegion(blitz) === region);
const base = Math.ceil(users.length / PLAYERS_PER_CHUNK);
const chunks = times(base, (offset) => ({
  offset,
  users: users.filter((user) => user.blitz % base === offset),
}));
const batches = chunk(chunks, CHUNKS_PER_BATCH);
const manifestWriteStream = new RtsmWriteStream();

console.log(`Found ${users.length} players in ${region}`);

await commitAssets(
  `regular tank stats manifests ${todayPath}`,
  [
    {
      encoding: 'base64',
      path: `regions/${region}/regular/tanks/${todayPath}/manifest.rtsm`,
      content: Buffer.from(
        compress(manifestWriteStream.rtsm(base).uint8Array),
      ).toString('base64'),
    },
  ],
  production,
);

let batchesDone = 0;
for (const batch of batches) {
  console.log(`Batch ${++batchesDone} of ${batches.length}`);

  const changes: FileChange[] = [];

  let chunksDone = 0;
  for (const chunk of batch) {
    console.log(`Chunk ${++chunksDone} of ${chunks.length}`);

    let playersDone = 0;
    const players = await Promise.all(
      chunk.users.map(async (user) => {
        const tanks = await getTankStats(region, user.blitz);

        console.log(`Player ${++playersDone} of ${chunk.users.length}`);

        if (tanks === null) return null;

        return {
          id: user.blitz,
          tanks,
        } satisfies RtscWritePlayer;
      }),
    ).then((players) => players.filter((player) => player !== null));
    const writeStream = new RtscWriteStream();

    writeStream.rtsc(players);
    changes.push({
      encoding: 'base64',
      content: Buffer.from(compress(writeStream.uint8Array)).toString('base64'),
      path: `regions/${region}/regular/tanks/${todayPath}/${chunk.offset}.rtsc.lz4`,
    });
  }

  // do not await; commit in background
  commitAssets(
    `regular tank stats ${todayPath} batch ${batches.indexOf(batch) + 1}`,
    changes,
    production,
  );
}
