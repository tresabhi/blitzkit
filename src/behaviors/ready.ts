import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import discord from '../../discord.json' assert { type: 'json' };
import { POSITIVE_COLOR } from '../constants/colors.js';
import isDev from '../utilities/isDev.js';

export default function ready(client: Client<true>) {
  (
    client.guilds.cache
      .get(discord.guild_id)
      ?.channels.cache.get(discord.log_channel) as TextChannel
  ).send({
    embeds: [
      new EmbedBuilder()
        .setTitle(`${client.user.username} came online`)
        .setDescription('All systems operating properly')
        .setColor(POSITIVE_COLOR),
    ],
  });

  console.log(
    `Logged in as ${client.user.tag} in ${
      isDev() ? 'development' : 'production'
    } mode`,
  );
}
