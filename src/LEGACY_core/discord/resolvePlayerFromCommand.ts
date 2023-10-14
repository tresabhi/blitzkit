import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { Region } from '../../constants/regions';
import searchPlayersAcrossRegions from '../../core/blitz/searchPlayersAcrossRegions';
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
  const commandUsername = interaction.options.getString('username');

  if (commandUsername) {
    if (serverAndIdPattern.test(commandUsername)) {
      const [server, accountId] = commandUsername.split('/');

      return {
        region: server as Region,
        id: Number(accountId),
      } satisfies ResolvedPlayer;
    } else {
      const accounts = await searchPlayersAcrossRegions(commandUsername);

      if (accounts[0]) {
        return {
          region: accounts[0].region,
          id: accounts[0].account_id,
        } satisfies ResolvedPlayer;
      } else {
        throw throwError(
          'Could not find user',
          `I couldn't find user "${markdownEscape(
            commandUsername,
          )}". Try picking an user from the search result, typing in a valid username, or using the \`/link\` command.`,
        );
      }
    }
  } else {
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
}
