import { SlashCommandBuilder } from 'discord.js';
import packageJSON from '../../package.json' assert { type: 'json' };
import { client } from '../core/discord/client';
import { CommandRegistry } from '../events/interactionCreate';

const executionStart = new Date().getTime();

export const debugCommand: CommandRegistry = {
  inProduction: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('debug')
    .setDescription('Debug information about the bot'),

  async handler() {
    const currentTime = new Date().getTime();
    const uptime = currentTime - executionStart;
    const list = [
      ['Version', packageJSON.version],
      ['Shard', client.shard?.ids[0] ?? 'default'],
      [
        'Uptime',
        `${Math.floor((uptime / 1000 / 60 / 60) % 24)}h ${Math.floor(
          (uptime / 1000 / 60) % 60,
        )}m ${Math.floor((uptime / 1000) % 60)}s ${Math.floor(
          uptime % 1000,
        )}ms`,
      ],
    ]
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n');

    return `# Debug\n\n${list}`;
  },
};
