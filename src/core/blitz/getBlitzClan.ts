import { BlitzServer } from '../../constants/servers';
import { serverAndIdPattern } from '../discord/resolvePlayerFromCommand';
import throwError from '../node/throwError';
import listClans from './listClans';

export default async function getBlitzClan(clan: string) {
  if (serverAndIdPattern.test(clan)) {
    const [server, accountId] = clan.split('/');
    return { server: server as BlitzServer, id: Number(accountId) };
  } else {
    const accounts = await listClans(clan);

    if (accounts[0]) {
      return { server: accounts[0].server, id: accounts[0].clan_id };
    } else {
      throw throwError(
        'Could not find clan',
        `I couldn't find clan \`${clan}\`. Try selecting a username from the search result.`,
      );
    }
  }
}
