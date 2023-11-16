import { AttachmentBuilder, SlashCommandBuilder } from 'discord.js';
import { CommandRegistry } from '../events/interactionCreate';

export const creditsCommand: CommandRegistry = {
  inProduction: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('credits')
    .setDescription('Me and the people who made this bot'),

  async handler() {
    return new AttachmentBuilder('https://i.imgur.com/ZF5ch33.png');
  },
};
