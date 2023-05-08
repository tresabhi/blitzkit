import { SlashCommandStringOption } from 'discord.js';

export default function addIGNOption(option: SlashCommandStringOption) {
  return option
    .setName('name')
    .setDescription('The username you use in Blitz')
    .setRequired(false);
}
