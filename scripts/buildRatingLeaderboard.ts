import { chunk } from 'lodash';
import { argv } from 'process';
import {
  RatingInfo,
  RatingNeighbors,
  RatingPlayer,
} from '../src/commands/ratingLeaderboard';
import { RegionSubdomain } from '../src/constants/regions';
import { getAccountInfo } from '../src/core/blitz/getAccountInfo';
import regionSubdomainToRegion from '../src/core/blitz/regionSubdomainToRegion';
import { commitAssets } from '../src/core/blitzkrieg/commitAssets';
import { FileChange } from '../src/core/blitzkrieg/commitMultipleFiles.js';
import { patientFetchJSON } from '../src/core/blitzkrieg/patientFetchJSON';
import { superCompress } from '../src/core/blitzkrieg/superCompress';
import {
  BkrlBaseEntry,
  BkrlFormat,
  BkrlSuperset1Entry,
  BkrlWriteStream,
} from '../src/core/streams/bkrl';
import { CdonValue, CdonWriteStream } from '../src/core/streams/cdon';

/*
 * Central North American Time (UTC-5): use 0 5 * * *.
 * Central European Time (UTC+1): use 0 23 * * *.
 * Central Asia Standard Time (UTC+7): use 0 17 * * *.
 */

const production = argv.includes('--production');
const target = argv
  .find((arg) => arg.startsWith('--target='))
  ?.split('=')[1] as 'midnight' | 'latest' | undefined;
const regionSubdomain = argv
  .find((arg) => arg.startsWith('--region='))
  ?.split('=')[1] as RegionSubdomain | undefined;

if (!target) throw new Error('Target parameter not specified');
if (!regionSubdomain) throw new Error('Region parameter not specified');

const region = regionSubdomainToRegion(regionSubdomain);

const NEIGHBORS = 2 ** 8;
const PLAYERS = await patientFetchJSON<RatingInfo>(
  `https://${regionSubdomain}.wotblitz.com/en/api/rating-leaderboards/season/`,
).then((data) => (data.detail === undefined ? data.count : undefined));

if (PLAYERS === undefined) {
  throw new Error('No current rating season running');
}

const players: Record<number, RatingPlayer> = {};
const leaderboard: BkrlBaseEntry[] = [];
let registered = 0;

async function branchFromPlayer(id: number) {
  const { neighbors } = await patientFetchJSON<RatingNeighbors>(
    `https://${regionSubdomain}.wotblitz.com/en/api/rating-leaderboards/user/${id}/?neighbors=${NEIGHBORS}`,
  );

  const firstPlayer = neighbors[0];
  const lastPlayer = neighbors[neighbors.length - 1];

  const branches: Promise<void>[] = [];
  if (!players[firstPlayer.number])
    branches.push(branchFromPlayer(firstPlayer.spa_id));
  if (!players[lastPlayer.number])
    branches.push(branchFromPlayer(lastPlayer.spa_id));

  neighbors.forEach((neighbor) => {
    if (players[neighbor.number]) return;

    players[neighbor.number] = neighbor;
    registered++;
  });

  console.log(
    `Registered ${registered} / ${PLAYERS} (${(
      (registered / PLAYERS!) *
      100
    ).toFixed(2)}%)`,
  );

  await Promise.all(branches);
}

async function branchFromLeague(id: number) {
  const { result } = await patientFetchJSON<{ result: RatingPlayer[] }>(
    `https://${regionSubdomain}.wotblitz.com/en/api/rating-leaderboards/league/${id}/top/`,
  );

  const firstPlayer = result[0];
  const lastPlayer = result.at(-1)!;

  await Promise.all([
    branchFromPlayer(firstPlayer.spa_id),
    branchFromPlayer(lastPlayer.spa_id),
  ]);
}

console.log('Branching from leagues...');
await Promise.all([
  branchFromLeague(0),
  branchFromLeague(1),
  branchFromLeague(2),
  branchFromLeague(3),
  branchFromLeague(4),
]);

console.log('Converting to an array...');
for (let index = 0; index < PLAYERS; index++) {
  const listing = players[index + 1];
  if (listing) {
    leaderboard[index] = { id: listing.spa_id, score: listing.score };
  } else {
    console.warn(`Position ${index + 1} had no player`);
    leaderboard[index] = { id: 0, score: 0 };
  }
}

console.log('Requesting further stats...');
const comprehensiveLeaderboard: BkrlSuperset1Entry[] = [];
let chunkIndex = 0;
for (const leaderboardChunk of chunk(leaderboard, 100)) {
  console.log(
    `Chunk ${chunkIndex + 1} of ${Math.ceil(leaderboard.length / 100)}`,
  );

  const stats = await getAccountInfo(
    region,
    leaderboardChunk.map(({ id }) => id),
    ['statistics.rating'],
  );

  stats.forEach((stat, index) => {
    const trueIndex = chunkIndex * 100 + index;
    comprehensiveLeaderboard[trueIndex] =
      leaderboardChunk[index].id === 0
        ? {
            battles: 0,
            damage: 0,
            id: 0,
            kills: 0,
            score: 0,
            survived: 0,
            wins: 0,
          }
        : {
            id: leaderboardChunk[index].id,
            score: leaderboardChunk[index].score,
            battles: stat.statistics.rating!.battles,
            damage: stat.statistics.rating!.damage_dealt,
            kills: stat.statistics.rating!.frags,
            survived: stat.statistics.rating!.survived_battles,
            wins: stat.statistics.rating!.wins,
          };
  });

  chunkIndex++;
}

const info = await patientFetchJSON<RatingInfo & { detail: undefined }>(
  `https://${regionSubdomain}.wotblitz.com/en/api/rating-leaderboards/season/`,
);
const normalizedServer = regionSubdomain === 'na' ? 'com' : regionSubdomain;
const infoContent = new CdonWriteStream().cdon(
  info as unknown as CdonValue,
).uint8Array;
const leaderboardWriteStream = new BkrlWriteStream();

leaderboardWriteStream.bkrl({
  format: BkrlFormat.Superset1,
  entries: comprehensiveLeaderboard,
});

const changes: FileChange[] = [
  {
    path: `regions/${normalizedServer}/rating/${info.current_season}/info.cdon.lz4`,
    content: superCompress(infoContent),
    encoding: 'base64',
  },
  {
    path: `regions/${normalizedServer}/rating/${info.current_season}/${target}.bkrl`,
    content: Buffer.from(leaderboardWriteStream.uint8Array).toString('base64'),
    encoding: 'base64',
  },
];

commitAssets(
  `rating leaderboard ${regionSubdomain} ${target}`,
  changes,
  production,
);
