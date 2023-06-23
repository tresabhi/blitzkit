import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { BlitzServer } from '../../constants/servers.js';
import { serverAndIdPattern } from '../options/resolvePlayer.js';
import errorWithCause from '../process/errorWithCause.js';
import listClansPanServer from './listClansPanServer.js';

export default async function getBlitzClan(
  interaction: ChatInputCommandInteraction<CacheType>,
  clan: string,
) {
  if (serverAndIdPattern.test(clan)) {
    const [server, accountId] = clan.split('/');
    return { server: server as BlitzServer, id: Number(accountId) };
  } else {
    const accounts = await listClansPanServer(clan);

    if (accounts[0]) {
      return { server: accounts[0].server, id: accounts[0].clan_id };
    } else {
      throw errorWithCause(
        'Could not find clan',
        `I couldn't find clan \`${clan}\`. Try selecting a username from the search result.`,
      );
    }
  }
}
