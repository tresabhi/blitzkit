import { Locale } from 'discord.js';
import { REGIONS } from '../src/constants/regions';
import getTankStats from '../src/core/blitz/getTankStats';
import { idToRegion } from '../src/core/blitz/idToRegion';
import usersRaw from '../test.users.json';

let done = 0;

const users = usersRaw.slice(0, 100);
const regionUsers = REGIONS.map((region) =>
  users.filter((user) => idToRegion(user.blitz) === region),
);
const regionChunkedUsers = await Promise.all(
  regionUsers.map(async (regionUsers, index) => {
    return await Promise.all(
      regionUsers.map(async (user) => {
        const region = REGIONS[index];
        const stats = await getTankStats(region, user.blitz, Locale.EnglishUS);

        console.log(`Fetch user ${++done} / ${users.length}`);

        return stats;
      }),
    );
  }),
);

regionChunkedUsers.map((users, regionIndex) => {
  const region = REGIONS[regionIndex];

  console.log(region, users.length);
});
