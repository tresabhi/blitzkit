import { EmbedBuilder } from 'discord.js';
import { INFO_COLOR } from '../../constants/colors.js';

export default function infoEmbed(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(INFO_COLOR)
    .setTitle(title)
    .setDescription(description);
}
