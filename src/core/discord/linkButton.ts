import {
  ButtonBuilder,
  ButtonStyle,
  ComponentEmojiResolvable,
} from 'discord.js';
import { CYCLIC_API } from '../../constants/cyclic.js';

export default function linkButton(
  id: string,
  label: string,
  emoji?: ComponentEmojiResolvable,
) {
  const button = new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setURL(`${CYCLIC_API}/${id}`)
    .setLabel(label);

  if (emoji) button.setEmoji(emoji);

  return button;
}
