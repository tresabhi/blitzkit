import { usersDatabase } from '../../databases/users';
import { idToRegion } from '../blitz/idToRegion';
import { flagUserActivity } from './flagUserActivity';

export async function getBlitzFromDiscord(discordId: bigint) {
  const unique = await usersDatabase.discordUser.findUnique({
    where: { discord_id: discordId },
  });

  if (unique === null) return null;

  await flagUserActivity(unique.blitz_id);
  return { id: unique.blitz_id, region: idToRegion(unique.blitz_id) };
}
