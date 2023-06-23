import { SlashCommandStringOption } from 'discord.js';

export default function addUsernameOption(option: SlashCommandStringOption) {
  return option
    .setName('username')
    .setDescription(
      'The username you use in Blitz (inferred from Discord nickname by default)',
    )
    .setAutocomplete(true);
}
