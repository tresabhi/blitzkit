import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  EmbedBuilder,
  InteractionEditReplyOptions,
  InteractionReplyOptions,
  MessageEditOptions,
} from 'discord.js';
import { InteractionReturnable } from '../../events/interactionCreate';
import jsxToPngThreaded from '../blitzkit/jsxToPngThreaded';

export default async function normalizeInteractionReturnable(
  returnable: InteractionReturnable,
) {
  const images: [number, Buffer][] = [];
  const reply: InteractionEditReplyOptions &
    InteractionReplyOptions &
    MessageEditOptions = {};

  const awaitedReturnable = await returnable;
  const normalizedReturnable = Array.isArray(awaitedReturnable)
    ? awaitedReturnable
    : [awaitedReturnable];

  await Promise.all(
    normalizedReturnable.map(async (item, index) => {
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
        const image = await jsxToPngThreaded(item);
        images.push([index, image]);
      }
    }),
  );

  if (images.length > 0) {
    images.sort(([a], [b]) => b - a);
    if (!reply.files) reply.files = [];
    images.forEach(([, image]) => reply.files?.push(image));
  }

  return reply;
}
