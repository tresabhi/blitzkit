import { EmbedBuilder, GuildMember, TextChannel } from 'discord.js';
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
            `Welcome to the Skilled server, **${member.user.username}**! To continue, please use the \`/verify\` command.\n\nExample: \`/verify Sabina244\``,
          ),
      ],
    });

    console.log(`${member.user.tag} joined`);
  }
}
