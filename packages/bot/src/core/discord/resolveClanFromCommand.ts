import { idToRegion, searchClansAcrossRegions } from '@blitzkit/core';
import { ChatInputCommandInteraction } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { UserError } from '../blitzkit/userError';
import { translator } from '../localization/translator';

export async function resolveClanFromCommand(
  interaction: ChatInputCommandInteraction,
) {
  const { translate } = translator(interaction.locale);
  const clan = interaction.options.getString('clan', true);
  const id = parseInt(clan);

  if (isNaN(id)) {
    const region = idToRegion(id);
    return { region, id };
  } else {
    const accounts = await searchClansAcrossRegions(clan);

    if (accounts[0]) {
      return { region: accounts[0].region, id: accounts[0].clan_id };
    } else {
      throw new UserError(
        translate('bot.common.errors.clan_not_found', [markdownEscape(clan)]),
      );
    }
  }
}
