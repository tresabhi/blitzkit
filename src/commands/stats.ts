import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { SERVERS } from '../constants/servers.js';

export async function execute(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  interaction.reply('YOU SUCK MORON GO PLAY ROBLOX');
}

export const data = new SlashCommandBuilder()
  .setName('stats')
  .setDescription("Gets the user's in-game statistics")
  .addStringOption((option) =>
    option
      .setName('server')
      .setDescription('The Blitz server you are in')
      .addChoices(
        { name: SERVERS.com, value: 'com' },
        { name: SERVERS.eu, value: 'eu' },
        { name: SERVERS.asia, value: 'asia' },
      )
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('ign')
      .setDescription('The username you use in Blitz')
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('period')
      .setDescription('The last number of days of stats')
      .setChoices(
        { name: '30 Days', value: '30' },
        { name: '60 Days', value: '60' },
        { name: '90 Days', value: '90' },
        { name: 'Career', value: 'career' },
      )
      .setRequired(true),
  );
