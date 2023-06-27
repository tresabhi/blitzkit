import { SlashCommandBuilder } from 'discord.js';
import addUsernameChoices from '../core/discord/addUsernameChoices.js';
import autocompleteUsername from '../core/discord/autocompleteUsername.js';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand.js';
import { CommandRegistry } from '../events/interactionCreate/index.js';
import today from '../renderers/today.js';

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('today')
    .setDescription('A general daily breakdown of your performance')
    .addStringOption(addUsernameChoices),

  async handler(interaction) {
    const player = await resolvePlayerFromCommand(interaction);

    return await today(player);
  },

  autocomplete: autocompleteUsername,
} satisfies CommandRegistry;
