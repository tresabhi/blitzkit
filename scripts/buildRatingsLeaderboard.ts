import { Octokit } from '@octokit/rest';
import { rm, writeFile } from 'fs/promises';
import { argv, env } from 'process';
import {
  RatingsInfo,
  RatingsNeighbors,
  RatingsPlayer,
} from '../src/commands/ratings';
import { patientFetchJSON } from '../src/core/blitzkrieg/patientFetchJSON';
import commitMultipleFiles from './commitMultipleFiles.js';

/*
 * Central North American Time (UTC-5): use 0 5 * * *.
 * Central European Time (UTC+1): use 0 23 * * *.
 * Central Asia Standard Time (UTC+7): use 0 17 * * *.
 *
 * [region]/ratings/[season]/info.json: season info like rewards, start & end time, etc.
 * [region]/ratings/[season]/latest.json: the absolute latest leaderboard recorded at UTC+0 midnight
 * [region]/ratings/[season]/midnight.json: last midnight's leaderboard relative to the region
 */

export type BlitzkriegRatingsLeaderboardEntry = { id: number; score: number };
export type BlitzkriegRatingsLeaderboard = BlitzkriegRatingsLeaderboardEntry[];

const publish = argv.includes('--publish');
const target = argv
  .find((arg) => arg.startsWith('--target='))
  ?.split('=')[1] as 'midnight' | 'latest' | undefined;
const server = argv.find((arg) => arg.startsWith('--region='))?.split('=')[1];

if (!target) throw new Error('Target parameter not specified');
if (!server) throw new Error('Region parameter not specified');

const NEIGHBORS = 2 ** 8;
const PLAYERS = await patientFetchJSON<RatingsInfo>(
  `https://${server}.wotblitz.com/en/api/rating-leaderboards/season/`,
).then((data) => (data.detail === undefined ? data.count : undefined));

if (PLAYERS === undefined) {
  throw new Error('No current ratings season running');
}

const players: Record<number, RatingsPlayer> = {};
const leaderboard: BlitzkriegRatingsLeaderboard = [];
let registered = 0;

async function branchFromPlayer(id: number) {
  const { neighbors } = await patientFetchJSON<RatingsNeighbors>(
    `https://${server}.wotblitz.com/en/api/rating-leaderboards/user/${id}/?neighbors=${NEIGHBORS}`,
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
  const { result } = await patientFetchJSON<{ result: RatingsPlayer[] }>(
    `https://${server}.wotblitz.com/en/api/rating-leaderboards/league/${id}/top/`,
  );

  const firstPlayer = result[0];
  const lastPlayer = result[result.length - 1];

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
  if (!listing) {
    console.warn(`Position ${index + 1} had no player`);
    continue;
  }

  leaderboard[index] = {
    id: listing.spa_id,
    score: listing.score,
  };
}

const leaderboardJSON = JSON.stringify(leaderboard);

if (publish) {
  const octokit = new Octokit({ auth: env.GH_TOKEN });
  const info = await patientFetchJSON<RatingsInfo & { detail: undefined }>(
    `https://${server}.wotblitz.com/en/api/rating-leaderboards/season/`,
  );
  const normalizedServer = server === 'na' ? 'com' : server;
  const infoPath = `regions/${normalizedServer}/ratings/${info.current_season}/info.json`;
  const leaderboardPath = `regions/${normalizedServer}/ratings/${info.current_season}/${target}.json`;
  const infoJSON = JSON.stringify(info);

  console.log(`Publishing to season ${info.current_season}...`);
  commitMultipleFiles(
    octokit,
    'tresabhi',
    'blitzkrieg-assets',
    'main',
    new Date().toString(),
    [
      { path: infoPath, content: infoJSON },
      { path: leaderboardPath, content: leaderboardJSON },
    ],
  );
} else {
  console.log('Writing to disk...');
  await rm('dist.json', { force: true });
  await writeFile('dist.json', leaderboardJSON);
}
