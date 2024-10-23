import { EmbedBuilder } from 'discord.js';
import { ACCENT_COLOR } from './colors';

export function embedInfo(title: string, description: string) {
  const embed = new EmbedBuilder()
    .setColor(ACCENT_COLOR)
    .setDescription(description);

  if (title) embed.setTitle(title);

  return embed;
}
