import { SlashCommandBuilder } from 'discord.js';
import addUsernameOption from '../core/discord/addUsernameOption.js';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand.js';
import usernameAutocomplete from '../core/discord/usernameAutocomplete.js';
import { CommandRegistry } from '../events/interactionCreate/index.js';
import today from '../renderers/today.js';

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('today')
    .setDescription('A general daily breakdown of your performance')
    .addStringOption(addUsernameOption),

  async handler(interaction) {
    const player = await resolvePlayerFromCommand(interaction);

    return await today(player);
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;
