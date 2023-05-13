import { EmbedBuilder } from 'discord.js';
import { SKILLED_COLOR } from '../../constants/colors.js';

export default function sklldEmbed(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(SKILLED_COLOR)
    .setTitle(title)
    .setDescription(description);
}
