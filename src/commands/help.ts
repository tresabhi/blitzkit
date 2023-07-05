import { SlashCommandBuilder } from 'discord.js';
import discord from '../../discord.json' assert { type: 'json' };
import { client } from '../bot.js';
import embedInfo from '../core/discord/embedInfo.js';
import {
  CommandRegistry,
  guildCommands,
  publicCommands,
} from '../events/interactionCreate/index.js';

export const helpCommand: CommandRegistry = {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('help')
    .setDescription('All the help you need about the bot'),

  handler(interaction) {
    return embedInfo(
      `${client.user?.username} help`,
      `**About**\n${
        client.user?.username
      } automates many mundane tasks and provide statistics in numerous flexible ways.\n\nMade by TresAbhi from the Skilled [SKLLD] clan.\nGitHub: https://github.com/tresabhi/blitzkrieg\nDiscord server: https://discord.gg/nDt7AjGJQH\nSkilled server: https://discord.gg/ZPvcEG7DS8\n\n**Commands**\n${(interaction.guildId ===
      discord.sklld_guild_id
        ? [...guildCommands, ...publicCommands]
        : publicCommands
      )
        .map((command) => `**/${command.name}**: ${command.description}`)
        .join(
          '\n',
        )}\n\n*I am a new bot; I may make mistakes and go offline unexpectedly from time to time.*`,
    );
  },
};
