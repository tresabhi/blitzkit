import { EmbedBuilder } from 'discord.js';
import { NEGATIVE_COLOR } from '../../constants/colors.js';

export default function embedNegative(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(NEGATIVE_COLOR)
    .setTitle(title)
    .setDescription(description);
}
