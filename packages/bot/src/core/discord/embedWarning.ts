import { EmbedBuilder } from 'discord.js';
import { WARNING_COLOR } from './colors';

export function embedWarning(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(WARNING_COLOR)
    .setTitle(title)
    .setDescription(description);
}
