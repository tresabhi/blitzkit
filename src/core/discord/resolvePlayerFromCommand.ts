import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { Region } from '../../constants/regions';
import { getBlitzFromDiscord } from '../cockroackdb/discordBlitz';
import throwError from '../node/throwError';

export const serverAndIdPattern = /(com|eu|asia)\/[0-9]+/;

export interface ResolvedPlayer {
  region: Region;
  id: number;
}

export default async function resolvePlayerFromCommand(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  const account = await getBlitzFromDiscord(parseInt(interaction.user.id));

  if (account) {
    return { region: account.region, id: account.blitz };
  } else {
    throw throwError(
      "You're not linked",
      'Use the `/link` command to link your Discord and Blitz accounts.',
    );
  }
}
