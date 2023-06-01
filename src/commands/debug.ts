import { SlashCommandBuilder } from 'discord.js';
import packageJSON from '../../package.json' assert { type: 'json' };
import { tankopedia } from '../core/blitz/tankopedia.js';
import { tankAverages } from '../core/blitzstars/tankaverages.js';
import cleanTable from '../core/interaction/cleanTable.js';
import cmdName from '../core/interaction/cmdName.js';
import infoEmbed from '../core/interaction/infoEmbed.js';
import getClientId from '../core/process/getClientId.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { client } from '../index.js';

const executionStart = new Date().getTime();

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('debug'))
    .setDescription('Debug information about the bot'),

  async execute(interaction) {
    const currentTime = new Date().getTime();
    const uptime = currentTime - executionStart;

    await interaction.editReply({
      embeds: [
        infoEmbed(
          `${client.user?.username} debug information`,
          cleanTable([
            ['Version', packageJSON.version],
            ['Client ID', getClientId()],
            ['Tag', interaction.client.user.tag],
            [
              'Uptime',
              `${Math.floor(uptime / 1000 / 60 / 60 / 24)}d ${Math.floor(
                (uptime / 1000 / 60 / 60) % 24,
              )}h ${Math.floor((uptime / 1000 / 60) % 60)}m ${Math.floor(
                (uptime / 1000) % 60,
              )}s ${Math.floor(uptime % 1000)}ms`,
            ],
            ['Tankopedia cached', `${tankopedia !== undefined}`],
            ['Tank averages cached', `${tankAverages !== undefined}`],
          ]),
        ),
      ],
    });

    console.log("Displaying bot's debug information");
  },
} satisfies CommandRegistry;
