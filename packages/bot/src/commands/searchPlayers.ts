import { Region } from '@blitzkit/core';
import { Locale } from 'discord.js';
import markdownEscape from 'markdown-escape';
import fetchBlitz from '../../../website/src/core/blitz/fetchBlitz';
import { AccountList } from '../../../website/src/core/blitz/searchPlayersAcrossRegions';
import { usernamePattern } from '../../../website/src/core/blitz/searchPlayersAcrossRegions/constants';
import addRegionChoices from '../core/discord/addRegionChoices';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import embedInfo from '../core/discord/embedInfo';
import { localizationObject } from '../core/discord/localizationObject';
import { translator } from '../core/localization/translator';
import { CommandRegistry } from '../events/interactionCreate';

const DEFAULT_LIMIT = 25;

export const searchPlayersCommand = new Promise<CommandRegistry>((resolve) => {
  const { t, translate } = translator(Locale.EnglishUS);

  resolve({
    command: createLocalizedCommand('search-players')
      .addStringOption(addRegionChoices)
      .addStringOption((option) =>
        addUsernameChoices(option).setAutocomplete(false).setRequired(true),
      )
      .addIntegerOption((option) =>
        option
          .setName(t`bot.commands.search_players.options.limit`)
          .setNameLocalizations(
            localizationObject('bot.commands.search_players.options.limit'),
          )
          .setDescription(
            translate('bot.commands.search_players.options.limit.description', [
              `${DEFAULT_LIMIT}`,
            ]),
          )
          .setDescriptionLocalizations(
            localizationObject(
              'bot.commands.search_players.options.limit.description',
              [`${DEFAULT_LIMIT}`],
            ),
          )
          .setMinValue(1)
          .setMaxValue(100),
      ),

    async handler(interaction) {
      const { translate } = translator(interaction.locale);
      const region = interaction.options.getString('region') as Region;
      const name = interaction.options.getString('username')!;
      const limit = interaction.options.getInteger('limit') ?? 25;
      const trimmedSearch = name.trim();
      const players = usernamePattern.test(trimmedSearch)
        ? await fetchBlitz<AccountList>(region, 'account/list', {
            search: trimmedSearch,
            limit,
          })
        : [];

      return embedInfo(
        translate('bot.commands.search_players.body.title', [
          markdownEscape(trimmedSearch),
          translate(`common.regions.normal.${region}`),
        ]),
        `\`\`\`${
          players.length === 0
            ? translate('bot.commands.search_players.body.no_results')
            : players.map((player) => player.nickname).join('\n')
        }\`\`\``,
      );
    },
  });
});
