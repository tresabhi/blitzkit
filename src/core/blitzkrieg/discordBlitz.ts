import { Region } from '../../constants/regions';
import { discordBlitzDB } from './discordBlitzDB';

export function linkBlitzAndDiscord(
  discord: number,
  region: Region,
  blitz: number,
) {
  return discordBlitzDB.discord_blitz.upsert({
    where: { discord },
    update: { region, blitz },
    create: { discord, region, blitz },
  });
}

export function getBlitzFromDiscord(discord: number) {
  return discordBlitzDB.discord_blitz.findUnique({
    where: { discord },
    select: { region: true, blitz: true },
  }) as Promise<null | { region: Region; blitz: number }>;
}
