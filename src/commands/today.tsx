import { SlashCommandBuilder } from 'discord.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import resolvePlayer from '../core/options/resolvePlayer.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import today from '../renderers/today.js';

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('today')
    .setDescription('A general daily breakdown of your performance')
    .addStringOption(addUsernameOption),

  async execute(interaction) {
    const player = await resolvePlayer(interaction);

    return await today(player);
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;
