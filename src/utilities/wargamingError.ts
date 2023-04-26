import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { NEGATIVE_COLOR } from '../constants/colors.js';

export default async function wargamingError(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(NEGATIVE_COLOR)
        .setTitle('Skilled Bot ran into an issue')
        .setDescription('Wargaming returned an error. Please try again later.'),
    ],
  });

  console.log('Wargaming returned an error.');
}
