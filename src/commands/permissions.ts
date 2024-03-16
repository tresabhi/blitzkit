import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import { translator } from '../core/localization/translator';
import { CommandRegistry } from '../events/interactionCreate';

export const permissionsCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    inProduction: true,
    inPublic: true,

    command: createLocalizedCommand('permissions'),

    async handler(interaction) {
      const { t, translate } = translator(interaction.locale);
      // friday the 13th permissions easter egg
      const isFridayThe13th =
        new Date().getDay() === 5 && new Date().getDate() === 13;
      const permissions = [
        [
          interaction.appPermissions?.has('ViewChannel'),
          t`bot.commands.permissions.body.view_channels`,
        ],
        [
          interaction.appPermissions?.has('ReadMessageHistory'),
          t`bot.commands.permissions.body.read_message_history`,
        ],
        [
          interaction.appPermissions?.has('AttachFiles'),
          t`bot.commands.permissions.body.attach_files`,
        ],
        [
          interaction.appPermissions?.has('UseExternalEmojis'),
          t`bot.commands.permissions.body.external_emojis`,
        ],
      ];
      const body = permissions
        .map(([hasPermission, description]) => {
          if (hasPermission) {
            return `${isFridayThe13th ? '😇' : '✅'} ${description}`;
          } else {
            return `${isFridayThe13th ? '💀' : '❌'} ${description}`;
          }
        })
        .join('\n');

      return translate('bot.commands.permissions.body.title', [body]);
    },
  });
});
