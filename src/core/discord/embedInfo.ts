import { EmbedBuilder } from 'discord.js';
import { ACCENT_COLOR } from '../../constants/colors';

export default function embedInfo(title: string, description: string) {
  const embed = new EmbedBuilder()
    .setColor(ACCENT_COLOR)
    .setDescription(description);

  if (title) embed.setTitle(title);

  return embed;
}
