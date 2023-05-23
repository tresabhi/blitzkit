import { SlashCommandBuilder } from 'discord.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import cmdName from '../core/interaction/cmdName.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { CommandRegistry } from '../events/interactionCreate.js';

export default {
  inProduction: false,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('today'))
    .setDescription('A brief summary of your performance today')
    .addStringOption(addUsernameOption),

  async execute(interaction) {
    // await page.goto('http:///stackoverflow.com', {
    //   waitUntil: 'networkidle0',
    // });

    interaction.editReply("let's do this!");
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;
