import { SlashCommandBuilder } from 'discord.js';
import { CommandRegistry } from '../events/interactionCreate';

export const pingCommand: CommandRegistry<true> = {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,
  handlesInteraction: true,

  command: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check if the bot is alive')
    .addSubcommand((option) =>
      option.setName('blitzkrieg').setDescription('Ping Blitzkrieg'),
    )
    .addSubcommand((option) =>
      option.setName('blitz').setDescription('Ping Blitz'),
    ),

  async handler(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const executionStart = Date.now();

    if (subcommand === 'blitzkrieg') {
      await interaction.editReply('Pong 🏓');
    } else {
      await fetch('https://api.wotblitz.com/');
    }

    const executionTime = Date.now() - executionStart;
    interaction.editReply(`Pong 🏓 - ${executionTime}ms`);
  },
};
