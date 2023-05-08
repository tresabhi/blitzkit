import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import packageJSON from '../../package.json' assert { type: 'json' };
import { CommandRegistry } from '../behaviors/interactionCreate.js';
import { SKILLED_COLOR } from '../constants/colors.js';
import { client } from '../index.js';
import getClientId from '../utilities/getClientId.js';
import { tankAverages } from '../utilities/tankAverages.js';
import { tankopedia } from '../utilities/tankopedia.js';

const executionStart = new Date().getTime();

export default {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('debug')
    .setDescription('Debug information about the bot'),

  async execute(interaction) {
    const currentTime = new Date().getTime();
    const uptime = currentTime - executionStart;

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${client.user?.username} debug information`)
          .setColor(SKILLED_COLOR)
          .setDescription(
            `**Version**: ${packageJSON.version}\n**Uptime**: ${Math.floor(
              uptime / 1000 / 60 / 60 / 24,
            )}d ${Math.floor((uptime / 1000 / 60 / 60) % 24)}h ${Math.floor(
              (uptime / 1000 / 60) % 60,
            )}m ${Math.floor((uptime / 1000) % 60)}s ${Math.floor(
              uptime % 1000,
            )}ms\n**Tankopedia**: ${
              tankopedia ? 'cached' : 'not cached'
            }\n**Tank averages**: ${
              tankAverages ? 'cached' : 'not cached'
            }\n**Client ID**: ${getClientId()}\n**Tag**: ${
              interaction.client.user.tag
            }`,
          ),
      ],
    });

    console.log("Displaying bot's debug information");
  },
} satisfies CommandRegistry;
