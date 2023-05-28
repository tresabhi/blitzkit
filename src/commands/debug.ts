import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import packageJSON from '../../package.json' assert { type: 'json' };
import { ACCENT_COLOR } from '../constants/colors.js';
import { tankopedia } from '../core/blitzstars/tankopedia.js';
import cmdName from '../core/interaction/cmdName.js';
import getClientId from '../core/process/getClientId.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { client } from '../index.js';

const executionStart = new Date().getTime();

export default {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('debug'))
    .setDescription('Debug information about the bot'),

  async execute(interaction) {
    const currentTime = new Date().getTime();
    const uptime = currentTime - executionStart;

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${client.user?.username} debug information`)
          .setColor(ACCENT_COLOR)
          .setDescription(
            `**Version**: ${packageJSON.version}\n**Uptime**: ${Math.floor(
              uptime / 1000 / 60 / 60 / 24,
            )}d ${Math.floor((uptime / 1000 / 60 / 60) % 24)}h ${Math.floor(
              (uptime / 1000 / 60) % 60,
            )}m ${Math.floor((uptime / 1000) % 60)}s ${Math.floor(
              uptime % 1000,
            )}ms\n**Tankopedia**: ${
              tankopedia ? 'cached' : 'not cached'
            }\n**Client ID**: ${getClientId()}\n**Tag**: ${
              interaction.client.user.tag
            }`,
          ),
      ],
    });

    console.log("Displaying bot's debug information");
  },
} satisfies CommandRegistry;
