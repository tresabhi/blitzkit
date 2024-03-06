import { SlashCommandBuilder } from 'discord.js';
import { CommandRegistry } from '../events/interactionCreate';

export const permissionsCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    inProduction: true,
    inPublic: true,

    command: new SlashCommandBuilder()
      .setName('permissions')
      .setDescription('Checks wether the bot has the required permissions'),

    async handler(interaction) {
      // friday the 13th permissions easter egg
      const isFridayThe13th =
        new Date().getDay() === 5 && new Date().getDate() === 13;
      const permissions = [
        [
          interaction.appPermissions?.has('ViewChannel'),
          'View channels: needed for the refresh button to work',
        ],
        [
          interaction.appPermissions?.has('ReadMessageHistory'),
          'Read message history: also needed for the refresh button to work',
        ],
        [
          interaction.appPermissions?.has('AttachFiles'),
          'Attach files: needed for image-based commands to work',
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

      return `# Permissions\n${body}`;
    },
  });
});
