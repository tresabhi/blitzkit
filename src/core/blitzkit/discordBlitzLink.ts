import { usersDatabase } from '../../databases/users';
import { idToRegion } from '../blitz/idToRegion';

export async function flagUserActivity(blitz: number) {
  await usersDatabase.users.upsert({
    where: { blitz },
    update: {},
    create: { blitz },
  });
}

export async function linkBlitzAndDiscord(discord: bigint, blitz: number) {
  await usersDatabase.discordUsers.upsert({
    where: { discord },
    update: { blitz },
    create: { discord, blitz },
  });
  await flagUserActivity(blitz);
}

export async function getBlitzFromDiscord(discord: bigint) {
  const unique = await usersDatabase.discordUsers.findUnique({
    where: { discord },
  });

  if (unique === null) return null;

  await flagUserActivity(unique.blitz);
  return { id: unique.blitz, region: idToRegion(unique.blitz) };
}
