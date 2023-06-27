import { EmbedBuilder } from 'discord.js';
import { POSITIVE_COLOR } from '../../constants/colors.js';

export default function positiveEmbed(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(POSITIVE_COLOR)
    .setTitle(title)
    .setDescription(description);
}
