import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { NEGATIVE_COLOR } from '../../constants/colors.js';
import { handleError } from '../../events/error.js';
import { client } from '../../index.js';

export default async function blitzStarsError(
  interaction: ChatInputCommandInteraction<CacheType>,
  error: Error,
  command: string,
) {
  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(NEGATIVE_COLOR)
        .setTitle(`${client.user?.username} ran into an issue`)
        .setDescription(
          'BlitzStars returned an error. Please try again later.',
        ),
    ],
  });

  console.log(`BlitzStars returned an error`);
  handleError(error, client, command);
}
