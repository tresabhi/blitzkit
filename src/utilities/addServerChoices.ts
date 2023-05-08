import { SlashCommandStringOption } from 'discord.js';
import { BLITZ_SERVERS } from '../constants/servers.js';

export default function addServerChoices(option: SlashCommandStringOption) {
  return option
    .setName('server')
    .setDescription('The Blitz server you are in')
    .addChoices(
      { name: BLITZ_SERVERS.com, value: 'com' },
      { name: BLITZ_SERVERS.eu, value: 'eu' },
      { name: BLITZ_SERVERS.asia, value: 'asia' },
    )
    .setRequired(false);
}
