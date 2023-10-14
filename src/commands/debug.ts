import { SlashCommandBuilder } from 'discord.js';
import packageJSON from '../../package.json' assert { type: 'json' };
import { tankopedia } from '../LEGACY_core/blitz/tankopedia';
import { tankAverages } from '../LEGACY_core/blitzstars/tankAverages';
import { client } from '../LEGACY_core/discord/client';
import embedInfo from '../LEGACY_core/discord/embedInfo';
import markdownTable from '../LEGACY_core/discord/markdownTable';
import getClientId from '../LEGACY_core/node/getClientId';
import { CommandRegistry } from '../events/interactionCreate';

const executionStart = new Date().getTime();

export const debugCommand: CommandRegistry = {
  inProduction: true,
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
