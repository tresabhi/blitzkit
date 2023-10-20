import { SlashCommandStringOption } from 'discord.js';

export default function addUsernameChoices(option: SlashCommandStringOption) {
  return option
    .setName('username')
    .setDescription('The username you use in Blitz')
    .setAutocomplete(true);
}
