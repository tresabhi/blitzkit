import { EmbedBuilder } from 'discord.js';
import { NEGATIVE_COLOR } from '../../constants/colors.js';

export default function negativeEmbed(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(NEGATIVE_COLOR)
    .setTitle(title)
    .setDescription(description);
}
