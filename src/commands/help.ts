import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import discord from '../../discord.json' assert { type: 'json' };
import {
  CommandRegistry,
  guildCommands,
  publicCommands,
} from '../behaviors/interactionCreate.js';
import { SKILLED_COLOR } from '../constants/colors.js';

export default {
  inProduction: false,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('help')
    .setDescription('All the help you need about the bot'),

  async execute(interaction) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Skilled Bot help')
          .setColor(SKILLED_COLOR)
          .setDescription(
            `**About**\nSkilled Bot provides many useful commands that automate many mundane tasks and provide statistics in just the right may.\Made by TresAbhi from the Skilled [SKLLD] clan.\nGitHub: https://github.com/sklld/bot\nSkilled: ADD THE LINK HERE I FORGOT\n\n**Commands**\n${(interaction.guildId ===
            discord.guild_id
              ? [...guildCommands, ...publicCommands]
              : publicCommands
            )
              .map((command) => `**/${command.name}**: ${command.description}`)
              .join(
                '\n',
              )})}\n\n*I am a new bot; I may make mistakes and go offline from time to time.*`,
          ),
      ],
    });

    console.log('Displaying help information');
  },
} satisfies CommandRegistry;
