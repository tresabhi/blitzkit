import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { BlitzServer } from '../../constants/servers.js';
import errorEmbed from '../interaction/errorEmbed.js';
import listAccountsPanServer from './listAccountsPanServer.js';

export const serverAndIdPattern = /(com|eu|asia)\/[0-9]+/;

export default async function getBlitzAccount(
  interaction: ChatInputCommandInteraction<CacheType>,
  username: string,
) {
  if (serverAndIdPattern.test(username)) {
    const [server, accountId] = username.split('/');
    return { server: server as BlitzServer, id: Number(accountId) };
  } else {
    const accounts = await listAccountsPanServer(username);

    if (accounts[0]) {
      return { server: accounts[0].server, id: accounts[0].account_id };
    } else {
      await interaction.editReply({
        embeds: [
          errorEmbed(
            'Could not find user',
            `I couldn't find user \`${username}\`. Try selecting a username from the search result.`,
          ),
        ],
      });

      throw new Error(`Could not find user "${username}"`);
    }
  }
}
