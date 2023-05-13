import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { handleError } from '../../behaviors/error.js';
import { NEGATIVE_COLOR } from '../../constants/colors.js';
import { client } from '../../index.js';

export default async function wargamingError(
  interaction: ChatInputCommandInteraction<CacheType>,
  error: Error,
  command: string,
) {
  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(NEGATIVE_COLOR)
        .setTitle(`${client.user?.username} ran into an issue`)
        .setDescription('Wargaming returned an error. Please try again later.'),
    ],
  });

  console.log(`Wargaming returned an error`);
  handleError(error, client, command);
}
