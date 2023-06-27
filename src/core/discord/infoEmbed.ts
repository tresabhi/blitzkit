import { EmbedBuilder } from 'discord.js';
import { ACCENT_COLOR } from '../../constants/colors.js';

export default function infoEmbed(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(ACCENT_COLOR)
    .setTitle(title)
    .setDescription(description);
}
