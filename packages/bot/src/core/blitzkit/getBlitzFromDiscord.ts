import { idToRegion } from '@blitzkit/core';
import { flagUserActivity } from '../db/flagUserActivity';
import { usersDatabase } from '../db/users';

export async function getBlitzFromDiscord(discordId: bigint) {
  const unique = await usersDatabase.discordUser.findUnique({
    where: { discord_id: discordId },
  });

  if (unique === null) return null;

  const id = Number(unique.blitz_id);

  await flagUserActivity(id);
  return { id, region: idToRegion(id) };
}
