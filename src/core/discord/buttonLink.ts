import {
  ButtonBuilder,
  ButtonStyle,
  ComponentEmojiResolvable,
} from 'discord.js';

export default function buttonLink(
  url: string,
  label: string,
  emoji?: ComponentEmojiResolvable,
) {
  const button = new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setURL(url)
    .setLabel(label);

  if (emoji) button.setEmoji(emoji);

  return button;
}
