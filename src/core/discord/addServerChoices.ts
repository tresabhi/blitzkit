import { SlashCommandStringOption } from 'discord.js';
import { REGION_NAMES } from '../../constants/regions';

export default function addServerChoices(option: SlashCommandStringOption) {
  return option
    .setName('server')
    .setDescription('The Blitz server you are in')
    .addChoices(
      { name: REGION_NAMES.com, value: 'com' },
      { name: REGION_NAMES.eu, value: 'eu' },
      { name: REGION_NAMES.asia, value: 'asia' },
    )
    .setRequired(true);
}
