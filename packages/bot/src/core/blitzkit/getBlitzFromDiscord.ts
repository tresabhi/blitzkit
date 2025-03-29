import { idToRegion, usersDatabase } from '@blitzkit/core';
import { flagUserActivity } from '@blitzkit/core/src/blitzkit/flagUserActivity';

export async function getBlitzFromDiscord(discordId: bigint) {
  const unique = await usersDatabase.discordUser.findUnique({
    where: { discord_id: discordId },
  });

  if (unique === null) return null;

  const id = Number(unique.blitz_id);

  await flagUserActivity(id);
  return { id, region: idToRegion(id) };
}
