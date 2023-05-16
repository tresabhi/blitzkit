import { SlashCommandStringOption } from 'discord.js';

export default function addClanOption(option: SlashCommandStringOption) {
  return option
    .setName('clan')
    .setDescription('The clan name or tag you are checking')
    .setAutocomplete(true)
    .setRequired(true);
}
