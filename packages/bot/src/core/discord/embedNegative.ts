import { EmbedBuilder } from 'discord.js';
import { NEGATIVE_COLOR } from './colors';

export function embedNegative(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(NEGATIVE_COLOR)
    .setTitle(title)
    .setDescription(description);
}
