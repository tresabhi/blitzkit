import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('verify')
  .setDescription('Verifies the user with Blitz');

export async function execute(interaction) {
  await interaction.reply('uwu i done nothin here uwu');
}
