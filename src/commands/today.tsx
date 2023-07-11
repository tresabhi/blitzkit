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
import { WARGAMING_APPLICATION_ID } from '../core/node/arguments';
import { CommandRegistry } from '../events/interactionCreate';
import today from '../renderers/today';
import { AccountInfo } from '../types/accountInfo';

export const todayCommand: CommandRegistry = {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('today')
    .setDescription('A general daily breakdown of your performance')
    .addStringOption(addUsernameChoices)
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription(
          'The maximum number of tanks to display (default: Infinity)',
        )
        .setRequired(false)
        .setMinValue(1),
    ),

  async handler(interaction) {
    const player = await resolvePlayerFromCommand(interaction);
    const limit = interaction.options.getInteger('limit') ?? Infinity;
    const { nickname } = (
      await getWargamingResponse<AccountInfo>(
        `https://api.wotblitz.${player.server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${player.id}`,
      )
    )[player.id];
    const path = interactionToURL(interaction, player);

    return [
      await today(player, limit, false),
      primaryButton(path, 'Refresh'),
      linkButton(`${CYCLIC_API}/${path}`, 'Embed'),
      linkButton(
        `https://www.blitzstars.com/player/${player.server}/${nickname}`,
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
