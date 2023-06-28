import { SlashCommandBuilder } from 'discord.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import addUsernameChoices from '../core/discord/addUsernameChoices.js';
import autocompleteUsername from '../core/discord/autocompleteUsername.js';
import interactionToURL from '../core/discord/interactionToURL.js';
import linkButton from '../core/discord/linkButton.js';
import primaryButton from '../core/discord/primaryButton.js';
import resolvePlayerFromButton from '../core/discord/resolvePlayerFromButton.js';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand.js';
import { WARGAMING_APPLICATION_ID } from '../core/node/arguments.js';
import { CommandRegistry } from '../events/interactionCreate/index.js';
import today from '../renderers/today.js';
import { AccountInfo } from '../types/accountInfo.js';

export default {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('today')
    .setDescription('A general daily breakdown of your performance')
    .addStringOption(addUsernameChoices),

  async handler(interaction) {
    const player = await resolvePlayerFromCommand(interaction);
    const { nickname } = (
      await getWargamingResponse<AccountInfo>(
        `https://api.wotblitz.${player.server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${player.id}`,
      )
    )[player.id];
    const path = interactionToURL(interaction, player);

    return [
      await today(player),
      primaryButton(path, 'Refresh'),
      // linkButton(`${CYCLIC_API}/${path}`, 'Embed'),
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
} satisfies CommandRegistry;
