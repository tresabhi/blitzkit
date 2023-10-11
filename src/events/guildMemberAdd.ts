import {
  AttachmentBuilder,
  EmbedBuilder,
  GuildMember,
  TextChannel,
} from 'discord.js';
import discord from '../../discord.json' assert { type: 'json' };
import { ACCENT_COLOR } from '../constants/colors';

export default async function (member: GuildMember) {
  if (member.guild.id === discord.sklld_guild_id) {
    await (
      member.guild.channels.cache.get(
        discord.sklld_verify_channel,
      ) as TextChannel
    ).send({
      content: member.toString(),
      embeds: [
        new EmbedBuilder()
          .setColor(ACCENT_COLOR)
          .setTitle(`Welcome ${member.user.username}`)
          .setDescription(
            `Welcome to the Skilled server, **${member.user.username}**! To continue, please use the \`/link\` command.`,
          ),
      ],
      files: [new AttachmentBuilder('https://i.imgur.com/2p6GFgC.gif')],
    });

    console.log(`${member.user.tag} joined`);
  }
}
