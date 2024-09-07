import packageJSON from '../../package.json' assert { type: 'json' };
import { client } from '../core/discord/client';
import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import { translator } from '../core/localization/translator';
import { CommandRegistry } from '../events/interactionCreate';

const executionStart = new Date().getTime();

export const debugCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    command: createLocalizedCommand('debug'),

    async handler(interaction) {
      const { t } = translator(interaction.locale);
      const currentTime = new Date().getTime();
      const uptime = currentTime - executionStart;
      const list = [
        [t`bot.commands.debug.body.version`, packageJSON.version],
        [
          t`bot.commands.debug.body.shard`,
          client.shard?.ids[0] ?? t`bot.commands.debug.body.shard.default`,
        ],
        [
          t`bot.commands.debug.body.uptime`,
          `${Math.floor((uptime / 1000 / 60 / 60) % 24)}h ${Math.floor(
            (uptime / 1000 / 60) % 60,
          )}m ${Math.floor((uptime / 1000) % 60)}s ${Math.floor(
            uptime % 1000,
          )}ms`,
        ],
      ];
      return t`bot.commands.debug.body.title${list
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n')}`;
    },
  });
});
