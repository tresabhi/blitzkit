import { SlashCommandStringOption } from 'discord.js';

export default function addTankChoices(option: SlashCommandStringOption) {
  return option
    .setName('tank')
    .setDescription('The tank to get stats for')
    .setAutocomplete(true)
    .setRequired(true);
}
