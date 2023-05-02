import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import discord from '../../discord.json' assert { type: 'json' };
import { NEGATIVE_COLOR } from '../constants/colors.js';
import { client } from '../index.js';
import isDev from '../utilities/isDev.js';

const PROCESS_ERROR_EVENTS = ['uncaughtException'];
const CLIENT_ERROR_EVENTS = ['error'];

export function handleError(error: Error, client: Client) {
  console.error(error);

  (
    client.guilds.cache
      .get(discord.guild_id)
      ?.channels.cache.get(discord.log_channel) as TextChannel
  ).send({
    embeds: [
      new EmbedBuilder()
        .setTitle(`${client.user?.username} ran into an error`)
        .setColor(NEGATIVE_COLOR)
        .setDescription(
          `\`\`\`${error.name}\n${error.message}\n${error.stack}\n${error.cause}\`\`\``,
        ),
    ],
  });
}

export function registerErrorHandlers() {
  if (!isDev()) {
    PROCESS_ERROR_EVENTS.forEach((name) =>
      process.on(name, (error) => handleError(error, client)),
    );
    CLIENT_ERROR_EVENTS.forEach((name) =>
      client.on(name, (error) => handleError(error, client)),
    );
  }

  return client;
}
