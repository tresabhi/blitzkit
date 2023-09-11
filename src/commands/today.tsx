import { SlashCommandBuilder } from 'discord.js';
import { CYCLIC_API } from '../constants/cyclic';
import getWargamingResponse from '../core/blitz/getWargamingResponse';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import interactionToURL from '../core/discord/interactionToURL';
import linkButton from '../core/discord/linkButton';
import primaryButton from '../core/discord/primaryButton';
import resolvePlayerFromButton from '../core/discord/resolvePlayerFromButton';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { secrets } from '../core/node/secrets';
import { CommandRegistry } from '../events/interactionCreate';
import today from '../renderers/today';
import { AccountInfo } from '../types/accountInfo';

export const todayCommand: CommandRegistry = {
  inProduction: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('today')
    .setDescription('A general daily breakdown of your performance')
    .addStringOption(addUsernameChoices)
    .addIntegerOption((option) =>
      option
        .setName('cutoff')
        .setDescription(
          'The maximum number of tanks to display (default: Infinity)',
        )
        .setRequired(false)
        .setMinValue(1),
    )
    .addIntegerOption((option) =>
      option
        .setName('maximized')
        .setDescription(
          'The number of rows with full stats after which all are collapsed (default: 4)',
        )
        .setMinValue(0)
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName('show-total')
        .setDescription('Show the total stats at the top (default: true)')
        .setRequired(false),
    ),

  async handler(interaction) {
    const player = await resolvePlayerFromCommand(interaction);
    const cutoff = interaction.options.getInteger('cutoff') ?? undefined;
    const maximized = interaction.options.getInteger('maximized') ?? undefined;
    const showTotal = interaction.options.getBoolean('show-total') ?? undefined;
    const { nickname } = (
      await getWargamingResponse<AccountInfo>(
        `https://api.wotblitz.${player.region}/wotb/account/info/?application_id=${secrets.WARGAMING_APPLICATION_ID}&account_id=${player.id}`,
      )
    )[player.id];
    const path = interactionToURL(interaction, {
      ...player,
      cutoff,
      maximized,
      'show-total': showTotal,
    });

    return [
      await today(player, cutoff, maximized, showTotal, false),
      primaryButton(path, 'Refresh'),
      // linkButton(`${CYCLIC_API}/${path}`, 'Embed'),
      linkButton(
        `https://www.blitzstars.com/player/${player.region}/${nickname}`,
        'BlitzStars',
      ),
    ];
  },

  autocomplete: autocompleteUsername,

  async button(interaction) {
    const player = await resolvePlayerFromButton(interaction);

    return await today(player);
  },
};
