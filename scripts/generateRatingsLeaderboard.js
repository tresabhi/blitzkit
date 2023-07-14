import { Octokit } from '@octokit/rest';
import { rm, writeFile } from 'fs/promises';
import { argv, env } from 'process';
import commitMultipleFiles from './commitMultipleFiles.js';

const publish = argv.includes('--publish');
const server = 'na';

const NEIGHBORS = 1000;
const PLAYERS = await fetch(
  `https://${server}.wotblitz.com/en/api/rating-leaderboards/season/`,
)
  .then((response) => response.json())
  .then((data) => data.count);

const players = {};
const leaderboard = [];
let registered = 0;

async function branchFromPlayer(id) {
  const { neighbors } = await fetch(
    `https://${server}.wotblitz.com/en/api/rating-leaderboards/user/${id}/?neighbors=${NEIGHBORS}`,
  ).then((response) => response.json());

  const firstPlayer = neighbors[0];
  const lastPlayer = neighbors[neighbors.length - 1];

  const branches = [];
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

async function branchFromLeague(id) {
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

console.log('Branching form leagues...');
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
  const octokit = new Octokit({ auth: env.GITHUB_TOKEN });

  const info = await fetch(
    `https://${server}.wotblitz.com/en/api/rating-leaderboards/season/`,
  ).then((response) => response.json());
  const time = Math.round(Date.now() / 1000);
  const normalizedServer = server === 'na' ? 'com' : server;

  const infoPath = `${normalizedServer}/ratings/seasons/${info.current_season}.json`;
  const leaderboardPath = `${normalizedServer}/ratings/leaderboards/${info.current_season}/${time}.json`;
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
