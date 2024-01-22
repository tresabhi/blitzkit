import { ChatInputCommandInteraction } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { Region } from '../../constants/regions';
import searchClansAcrossRegions from '../blitz/searchClansAcrossRegions';
import { UserError } from '../blitzkrieg/userError';
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
      throw new UserError(
        `# Could not find clan\nCouldn't find "${markdownEscape(clan)}". Try selecting a clan from the search result.`,
      );
    }
  }
}
