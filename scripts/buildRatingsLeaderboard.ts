import { Octokit } from '@octokit/rest';
import { rm, writeFile } from 'fs/promises';
import { argv, env } from 'process';
import commitMultipleFiles from './commitMultipleFiles.js';

interface RatingsSeasonInfo {
  count: number;
}

interface RatingsPlayer {
  number: number;
  spa_id: number;
}

interface RatingsNeighbors {
  neighbors: RatingsPlayer[];
}

/*
 * Central North American Time (UTC-5): use 0 5 * * *.
 * Central European Time (UTC+1): use 0 23 * * *.
 * Central Asia Standard Time (UTC+7): use 0 17 * * *.
 *
 * :region/ratings/:season/info.json: season info like rewards, start & end time, etc.
 * :region/ratings/:season/latest.json: the absolute latest leaderboard recorded at UTC+0 midnight
 * :region/ratings/:season/leaderboards/:time.json: collection of all recorded leaderboards at local midnights
 */

const publish = argv.includes('--publish');
const latest = argv.includes('--latest');
const server = argv.find((arg) => arg.startsWith('--region='))?.split('=')[1];

if (!server) throw new Error('Region parameter not specified');

const NEIGHBORS = 1000;
const PLAYERS = await fetch(
  `https://${server}.wotblitz.com/en/api/rating-leaderboards/season/`,
)
  .then((response) => response.json() as Promise<RatingsSeasonInfo>)
  .then((data) => data.count);

const players: Record<number, RatingsPlayer> = {};
const leaderboard: RatingsPlayer[] = [];
let registered = 0;

async function branchFromPlayer(id: number) {
  const { neighbors } = await fetch(
    `https://${server}.wotblitz.com/en/api/rating-leaderboards/user/${id}/?neighbors=${NEIGHBORS}`,
  ).then((response) => response.json() as Promise<RatingsNeighbors>);

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
      (registered / PLAYERS) *
      100
    ).toFixed(2)}%)`,
  );

  await Promise.all(branches);
}

async function branchFromLeague(id: number) {
  const { result } = await fetch(
    `https://${server}.wotblitz.com/en/api/rating-leaderboards/league/${id}/top/`,
  ).then((response) => response.json());

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
  leaderboard[index] = players[index + 1];
  if (!leaderboard[index]) console.warn(`${index} had no player`);
}

const leaderboardJSON = JSON.stringify(leaderboard);

if (publish) {
  const octokit = new Octokit({ auth: env.GH_TOKEN });

  const info = await fetch(
    `https://${server}.wotblitz.com/en/api/rating-leaderboards/season/`,
  ).then((response) => response.json());
  const time = Math.round(Date.now() / 1000);
  const normalizedServer = server === 'na' ? 'com' : server;

  const infoPath = `${normalizedServer}/ratings/${info.current_season}/info.json`;
  const leaderboardPath = `${normalizedServer}/ratings/${info.current_season}/${
    latest ? 'latest.json' : `leaderboards/${time}.json`
  }`;
  const infoJSON = JSON.stringify(info);

  console.log(`Publishing to season ${info.current_season}...`);
  commitMultipleFiles(
    octokit,
    'tresabhi',
    'blitzkrieg-db',
    'main',
    `${info.current_season}/${time}`,
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
