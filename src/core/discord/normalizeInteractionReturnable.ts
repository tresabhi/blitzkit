import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  InteractionEditReplyOptions,
} from 'discord.js';
import { InteractionReturnable } from '../../events/interactionCreate/index.js';
import jsxToPng from '../node/jsxToPng.js';

export default async function normalizeInteractionReturnable(
  returnable: InteractionReturnable,
) {
  const reply: InteractionEditReplyOptions = {};

  const awaitedReturnable = await returnable;
  const normalizedReturnable = Array.isArray(awaitedReturnable)
    ? awaitedReturnable
    : [awaitedReturnable];

  await Promise.all(
    normalizedReturnable.map(async (item) => {
      if (item instanceof EmbedBuilder) {
        if (!reply.embeds) reply.embeds = [];
        reply.embeds.push(item);
      } else if (item instanceof ButtonBuilder) {
        if (!reply.components)
          reply.components = [new ActionRowBuilder<ButtonBuilder>()];
        (reply.components[0] as ActionRowBuilder<ButtonBuilder>).addComponents(
          item,
        );
      } else {
        const image = await jsxToPng(item);
        if (!reply.files) reply.files = [];
        reply.files.push(image);
      }
    }),
  );

  return reply;
}
