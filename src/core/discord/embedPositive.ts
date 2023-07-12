import { EmbedBuilder } from 'discord.js';
import { POSITIVE_COLOR } from '../../constants/colors';

export default function embedPositive(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(POSITIVE_COLOR)
    .setTitle(title)
    .setDescription(description);
}
