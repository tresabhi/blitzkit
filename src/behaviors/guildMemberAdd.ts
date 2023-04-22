import { faker } from '@faker-js/faker';
import { EmbedBuilder, GuildMember, TextChannel } from 'discord.js';
import discord from '../../discord.json' assert { type: 'json' };
import { SKILLED_COLOR } from '../constants/colors.js';

export default async function (member: GuildMember) {
  console.log(`${member.user.tag} joined`);

  await (
    member.guild.channels.cache.get(discord.verify_channel) as TextChannel
  ).send({
    embeds: [
      new EmbedBuilder()
        .setColor(SKILLED_COLOR)
        .setTitle(`Welcome ${member.user.username}`)
        .setDescription(
          `Welcome to the Skilled server, **${
            member.user.username
          }**! To continue, please use the \`/verify\` command.\n\nExample: \`/verify NA ${faker.name.firstName()}${faker.datatype.number(
            { min: 1, max: 100 },
          )}\``,
        ),
    ],
  });
  await (
    member.guild.channels.cache.get(discord.verify_channel) as TextChannel
  ).send(member.toString());
}
