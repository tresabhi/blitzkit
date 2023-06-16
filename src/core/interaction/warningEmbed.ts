import { EmbedBuilder } from 'discord.js';
import { WARNING_COLOR } from '../../constants/colors.js';

export default function warningEmbed(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(WARNING_COLOR)
    .setTitle(title)
    .setDescription(description);
}
