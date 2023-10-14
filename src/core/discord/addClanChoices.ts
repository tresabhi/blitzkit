import { SlashCommandStringOption } from 'discord.js';

export default function addClanChoices(option: SlashCommandStringOption) {
  return option
    .setName('clan')
    .setDescription('The clan name or tag you are checking')
    .setAutocomplete(true)
    .setMinLength(2)
    .setRequired(true);
}
