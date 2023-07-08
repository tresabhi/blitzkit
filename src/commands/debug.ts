import { SlashCommandBuilder } from 'discord.js';
import packageJSON from '../../package.json' assert { type: 'json' };
import { client } from '../bot.js';
import { tankopedia } from '../core/blitz/tankopedia.js';
import { tankAverages } from '../core/blitzstars/tankAverages.js';
import embedInfo from '../core/discord/embedInfo.js';
import markdownTable from '../core/discord/markdownTable.js';
import getClientId from '../core/node/getClientId.js';
import { CommandRegistry } from '../events/interactionCreate/index.js';

const executionStart = new Date().getTime();

export const debugCommand: CommandRegistry = {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('debug')
    .setDescription('Debug information about the bot'),

  async handler(interaction) {
    const currentTime = new Date().getTime();
    const uptime = currentTime - executionStart;

    return embedInfo(
      `${client.user?.username} debug information`,
      markdownTable([
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
        ['Tankopedia cached', `${(await tankopedia) !== undefined}`],
        ['Tank averages cached', `${(await tankAverages) !== undefined}`],
      ]),
    );
  },
};
