import { flagUserActivity } from './flagUserActivity';
import { usersDatabase } from './users';

export async function linkBlitzAndDiscord(discordId: bigint, blitzId: number) {
  await usersDatabase.discordUser.upsert({
    where: { discord_id: discordId },
    update: { blitz_id: blitzId },
    create: { discord_id: discordId, blitz_id: blitzId },
  });
  await flagUserActivity(blitzId);
}
