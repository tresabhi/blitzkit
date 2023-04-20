import { faker } from '@faker-js/faker';
import { EmbedBuilder, GuildMember, TextChannel } from 'discord.js';
import config from '../../config.json' assert { type: 'json' };

export default async function (member: GuildMember) {
  console.log(`${member.user.tag} joined`);

  await (
    member.guild.channels.cache.get(
      config.discord_verify_channel,
    ) as TextChannel
  ).send({
    embeds: [
      new EmbedBuilder()
        .setColor('#8e3cf5')
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
    member.guild.channels.cache.get(
      config.discord_verify_channel,
    ) as TextChannel
  ).send(member.toString());
}
