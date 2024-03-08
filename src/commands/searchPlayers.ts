import { Locale } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { Region } from '../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../constants/wargamingApplicationID';
import fetchBlitz from '../core/blitz/fetchBlitz';
import {
  AccountList,
  usernamePattern,
} from '../core/blitz/searchPlayersAcrossRegions';
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
    inProduction: true,
    inPublic: true,

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
      const server = interaction.options.getString('region') as Region;
      const name = interaction.options.getString('username')!;
      const limit = interaction.options.getInteger('limit') ?? 25;
      const trimmedSearch = name.trim();
      const players = usernamePattern.test(trimmedSearch)
        ? await fetchBlitz<AccountList>(
            `https://api.wotblitz.${server}/wotb/account/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${encodeURIComponent(
              trimmedSearch,
            )}&limit=${limit}`,
          )
        : [];

      return embedInfo(
        translate('bot.commands.search_players.body.title', [
          markdownEscape(trimmedSearch),
          translate(`common.regions.normal.${server}`),
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
