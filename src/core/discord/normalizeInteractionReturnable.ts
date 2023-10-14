import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  EmbedBuilder,
  InteractionEditReplyOptions,
} from 'discord.js';
import { InteractionReturnable } from '../../events/interactionCreate';
import jsxToPng from '../blitzkrieg/jsxToPng';

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
      if (typeof item === 'string') {
        reply.content = item;
      } else if (item instanceof EmbedBuilder) {
        if (!reply.embeds) reply.embeds = [];
        reply.embeds.push(item);
      } else if (item instanceof ButtonBuilder) {
        if (!reply.components)
          reply.components = [new ActionRowBuilder<ButtonBuilder>()];
        (reply.components[0] as ActionRowBuilder<ButtonBuilder>).addComponents(
          item,
        );
      } else if (item instanceof AttachmentBuilder) {
        if (!reply.files) reply.files = [];
        reply.files.push(item);
      } else if (item === null) {
        return;
      } else {
        const image = await jsxToPng(item);
        if (!reply.files) reply.files = [];
        reply.files.push(image);
      }
    }),
  );

  return reply;
}
