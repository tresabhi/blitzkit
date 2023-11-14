import { AttachmentBuilder, GuildMember, TextChannel } from 'discord.js';
import discord from '../../discord.json' assert { type: 'json' };

export default async function (member: GuildMember) {
  if (member.guild.id === discord.sklld_guild_id) {
    await (
      member.guild.channels.cache.get(
        discord.sklld_verify_channel,
      ) as TextChannel
    ).send({
      content: `# Welcome, ${member.toString()}!\nPlease use the \`/link\` command like the video below to continue.`,
      files: [new AttachmentBuilder('https://i.imgur.com/2p6GFgC.gif')],
    });
  }
}
