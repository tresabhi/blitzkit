import { Locale } from 'discord.js';
import { chunk, times } from 'lodash';
import { compress } from 'lz4js';
import { argv } from 'process';
import { Region, REGIONS } from '../src/constants/regions';
import getTankStats from '../src/core/blitz/getTankStats';
import { idToRegion } from '../src/core/blitz/idToRegion';
import { commitAssets } from '../src/core/blitzkrieg/commitAssets';
import { FileChange } from '../src/core/blitzkrieg/commitMultipleFiles';
import {
  RtscWritePlayer,
  RtscWriteStream,
  RtsmWriteStream,
} from '../src/core/streams/rts';
import usersRaw from '../test.users.json';

const PLAYERS_PER_CHUNK = 256;
const CHUNKS_PER_BATCH = 128;

const production = argv.includes('--production');
const users = usersRaw; //.slice(0, 10);

let done = 0;
const regionSortedUsers = REGIONS.map((region) => ({
  region,
  users: users.filter((user) => idToRegion(user.blitz) === region),
}));

const today = new Date();
const todayPath = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
const bases: Partial<Record<Region, number>> = {};
const chunks = regionSortedUsers
  .map(({ region, users }) => {
    const base = Math.ceil(users.length / PLAYERS_PER_CHUNK);
    bases[region] = base;

    return times(base, (offset) => {
      return {
        region,
        offset,
        users: users.filter((user) => user.blitz % base === offset),
      };
    });
  })
  .flat();
const batches = chunk(chunks, CHUNKS_PER_BATCH);

const manifests = Object.entries(bases).map(([region, base]) => {
  const writeStream = new RtsmWriteStream();

  writeStream.rtsm(base);

  return {
    encoding: 'base64',
    path: `regions/${region}/regular/tanks/${todayPath}/manifest.rtsm`,
    content: Buffer.from(compress(writeStream.uint8Array)).toString('base64'),
  } satisfies FileChange;
});

await commitAssets(
  `regular tank stats manifests ${todayPath}`,
  manifests,
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
        const tanks = await getTankStats(
          chunk.region,
          user.blitz,
          Locale.EnglishUS,
        );

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
      path: `regions/${chunk.region}/regular/tanks/${todayPath}/${chunk.offset}.rtsc.lz4`,
    });
  }

  // do not await; commit in background
  commitAssets(
    `regular tank stats ${todayPath} batch ${batches.indexOf(batch) + 1}`,
    changes,
    production,
    false,
  );
}
