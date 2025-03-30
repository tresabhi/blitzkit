import { imgur } from '@blitzkit/core';
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
import { FunnyType } from '../../events/interactionCreate/handlers/chatInputCommand';
import { theme } from '../../stitches.config';
import { Writeable } from '../../types/writable';
import { jsxToPngThreaded } from '../blitzkit/jsxToPngThreaded';
import { RenderConfiguration } from '../blitzkit/renderConfiguration';

export async function normalizeInteractionReturnable(
  returnable: InteractionReturnable,
  funnyType?: FunnyType,
) {
  const images: [number, Buffer][] = [];
  const reply: InteractionEditReplyOptions &
    InteractionReplyOptions &
    MessageEditOptions = {};
  const awaitedReturnable = await returnable;
  const normalizedReturnable = Array.isArray(awaitedReturnable)
    ? awaitedReturnable
    : [awaitedReturnable];
  let renderConfiguration = new RenderConfiguration();

  await Promise.all(
    normalizedReturnable.map(async (item, index) => {
      if (typeof item === 'string') {
        reply.content = item;
      } else if (item instanceof EmbedBuilder) {
        if (!reply.embeds) reply.embeds = [];
        (reply.embeds as Writeable<typeof reply.embeds>).push(item);
      } else if (item instanceof ButtonBuilder) {
        if (!reply.components)
          reply.components = [new ActionRowBuilder<ButtonBuilder>()];
        (reply.components[0] as ActionRowBuilder<ButtonBuilder>).addComponents(
          item,
        );
      } else if (item instanceof AttachmentBuilder) {
        if (!reply.files) reply.files = [];
        (reply.files as Writeable<typeof reply.files>).push(item);
      } else if (item instanceof RenderConfiguration) {
        renderConfiguration = item;
      } else if (item === null) {
        return;
      } else {
        let jsx = item;

        switch (funnyType) {
          case FunnyType.Rude: {
            jsx = (
              <div
                style={{
                  display: 'flex',
                  position: 'relative',
                  backgroundColor: theme.colors.appBackground1,
                  boxShadow: 'inset 0 0 64px red',
                }}
              >
                {item}
              </div>
            );

            break;
          }

          case FunnyType.Weird: {
            const angle = (Math.random() * 2 - 1) * 10;
            jsx = (
              <div
                style={{
                  display: 'flex',
                  transform: `rotate(${angle}deg)`,
                  backgroundColor: theme.colors.appBackground1,
                  position: 'relative',
                }}
              >
                {item}

                <img
                  src={imgur('MWEny5u')}
                  style={{
                    display: 'block',
                    position: 'absolute',
                    top: 250,
                    left: '10%',
                    width: 100,
                    transform: 'translateY(-50%)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 3,
                  }}
                />

                <img
                  src={imgur('SboPMXY')}
                  style={{
                    position: 'absolute',
                    top: 280,
                    width: 80,
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />

                <img
                  src={imgur('MWEny5u')}
                  style={{
                    display: 'block',
                    position: 'absolute',
                    top: 250,
                    right: '10%',
                    width: 100,
                    transform: 'translateY(-50%)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 3,
                  }}
                />
              </div>
            );

            break;
          }
        }

        const image = await jsxToPngThreaded(jsx, renderConfiguration);
        images.push([index, image]);
      }
    }),
  );

  if (images.length > 0) {
    images.sort(([a], [b]) => b - a);
    if (!reply.files) reply.files = [];
    images.forEach(([, image]) =>
      (reply.files as Writeable<typeof reply.files>)?.push(image),
    );
  }

  return reply;
}
