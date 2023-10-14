import { ChatInputCommandInteraction } from 'discord.js';
import { Region } from '../../constants/regions';
import searchClansAcrossRegions from '../blitz/searchClansAcrossRegions';
import throwError from '../blitzkrieg/throwError';
import { serverAndIdPattern } from './resolvePlayerFromCommand';

export default async function resolveClanFromCommand(
  interaction: ChatInputCommandInteraction,
) {
  const clan = interaction.options.getString('clan', true);

  if (serverAndIdPattern.test(clan)) {
    const [server, accountId] = clan.split('/');
    return { region: server as Region, id: Number(accountId) };
  } else {
    const accounts = await searchClansAcrossRegions(clan);

    if (accounts[0]) {
      return { region: accounts[0].region, id: accounts[0].clan_id };
    } else {
      throw throwError(
        'Could not find clan',
        `I couldn't find clan \`${clan}\`. Try selecting a username from the search result.`,
      );
    }
  }
}
