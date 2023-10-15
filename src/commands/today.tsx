import { SlashCommandBuilder } from 'discord.js';
import { CommandRegistry } from '../events/interactionCreate';

/**
 * TODO: @deprecated
 */
export const todayCommand: CommandRegistry = {
  inProduction: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('today')
    .setDescription('This command has been renamed to `/breakdown today`'),

  handler() {
    return '# This command has been renamed to `/breakdown today`\n`/today` now comes with filters, periods and more! Use `/breakdown today` for same old functionality but also do checkout the other options.';
  },
};
