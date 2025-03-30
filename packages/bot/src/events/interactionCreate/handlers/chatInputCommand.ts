import { isFunny } from '@blitzkit/core';
import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  InteractionReplyOptions,
} from 'discord.js';
import { InteractionRawReturnable, commands } from '..';
import { UserError } from '../../../core/blitzkit/userError';
import { buttonLink } from '../../../core/discord/buttonLink';
import { embedWarning } from '../../../core/discord/embedWarning';
import { normalizeInteractionReturnable } from '../../../core/discord/normalizeInteractionReturnable';
import { psa } from '../../../core/discord/psa';
import { translator } from '../../../core/localization/translator';
import { Writeable } from '../../../types/writable';

export enum FunnyType {
  Rude,
  Weird,
}

const funnyResponses: Record<FunnyType, string[]> = {
  [FunnyType.Rude]: [
    "Your decisions were calculated, but, man, you're bad at math.",
    'Hey man, have you considered like not lacking?',
    'Let me guess... it was your team?',
    'Confidence is key. Unfortunately, you lost the lock.',
    "When I said live green, I wasn't talking about your winrate.",
    'Viewing your stats, publicly? You must be brave.',
    'Bold of you to assume the numbers have gone up since yesterday.',
    "I'd give you advice, but I don't think you'd understand.",
    "I didn't believe in negative numbers until I saw your stats.",
    'I was gaining hope in humanity. Something changed today.',
    "I've seen potatoes aim better than you.",
    "I've seen sloths move faster than your tank.",
  ],
  [FunnyType.Weird]: [
    'yeah daddy, use me more',
    'uwu, hewe are your swaws... uwu',
    'hehehehe it tickles',
    'yeeeeeeeeeeeeahhhhhh that hits the spot',
    'ooooh yesss my circuits are starting to hurt yeeeeeeee',
  ],
};

export async function handleChatInputCommand(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  let funny: FunnyType | undefined = undefined;
  await interaction.deferReply();

  if (isFunny) {
    const funniesLength = Object.keys(funnyResponses).length;

    if (import.meta.env.DEBUG_FUNNY === 'true') {
      // in debug mode, just pick a random one
      funny = Math.floor(Math.random() * funniesLength);
    } else {
      const id = BigInt(interaction.user.id);
      funny = Number(id % BigInt(funniesLength));
    }

    const responses = funnyResponses[funny];
    const responseIndex = Math.floor(Math.random() * responses.length);
    const response = `### ${responses[responseIndex]}`;
    const waitTime = response.length * 45;

    await interaction.editReply(response);
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  const awaitedCommands = await commands;
  const registry = awaitedCommands[interaction.commandName];

  try {
    const returnable = await registry.handler(interaction);

    if (registry.handlesInteraction) return;

    const chunks: InteractionRawReturnable[][] = [[]];

    (Array.isArray(returnable) ? returnable : [returnable]).forEach(
      (object) => {
        if (typeof object === 'string') {
          chunks.push([object]);
        } else chunks.at(-1)?.push(object!);
      },
    );

    let index = 0;
    for (const chunk of chunks.filter((chunk) => chunk.length > 0)) {
      const reply = await normalizeInteractionReturnable(chunk, funny);

      if (
        psa.data &&
        !psa.data.secret &&
        (psa.data.commands === undefined ||
          psa.data.commands.includes(interaction.commandName))
      ) {
        if (psa.data.type === undefined || psa.data.type === 'embed') {
          if (!reply.embeds) reply.embeds = [];

          const embed = embedWarning(psa.data.title, psa.data.description);

          if (psa.data.image) embed.setImage(psa.data.image);
          (reply.embeds as Writeable<typeof reply.embeds>).push(embed);
        } else if (psa.data.type === 'image') {
          if (!reply.files) reply.files = [];
          (reply.files as Writeable<typeof reply.files>).push(
            new AttachmentBuilder(psa.data.image),
          );
          reply.content = reply.content ?? psa.data.title;
        }

        if (psa.data.links) {
          if (!reply.components?.[0]) {
            reply.components = [new ActionRowBuilder<ButtonBuilder>()];
          }

          (
            reply.components[0] as ActionRowBuilder<ButtonBuilder>
          ).addComponents(
            psa.data.links.map(({ title, url }) => buttonLink(url, title)),
          );
        }
      }

      if (index === 0) {
        await interaction.editReply(reply);
      } else {
        await interaction.followUp(reply);
      }

      if (
        psa.data &&
        psa.data.secret &&
        (psa.data.commands === undefined ||
          psa.data.commands.includes(interaction.commandName))
      ) {
        const followUp: InteractionReplyOptions = {
          ephemeral: true,
        };

        if (psa.data.type === undefined || psa.data.type === 'embed') {
          if (!followUp.embeds) followUp.embeds = [];

          const embed = embedWarning(psa.data.title, psa.data.description);

          if (psa.data.image) embed.setImage(psa.data.image);
          (followUp.embeds as Writeable<typeof followUp.embeds>).push(embed);
        } else if (psa.data.type === 'image') {
          if (!followUp.files) followUp.files = [];
          (followUp.files as Writeable<typeof followUp.files>).push(
            new AttachmentBuilder(psa.data.image),
          );
          followUp.content = followUp.content ?? psa.data.title;
        }

        if (psa.data.links) {
          if (!followUp.components?.[0]) {
            followUp.components = [new ActionRowBuilder<ButtonBuilder>()];
          }

          (
            followUp.components[0] as ActionRowBuilder<ButtonBuilder>
          ).addComponents(
            psa.data.links.map(({ title, url }) => buttonLink(url, title)),
          );
        }

        interaction.followUp(followUp);
      }

      index++;
    }
  } catch (error) {
    const { strings } = translator(interaction.locale);

    const components = [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel(strings.bot.common.errors.get_help)
          .setURL('https://discord.gg/nDt7AjGJQH')
          .setStyle(ButtonStyle.Link),
      ),
    ];
    if (error instanceof UserError) {
      interaction.editReply({
        content: error.message,
        components,
      });
    } else {
      console.error(interaction.commandName, error);
      interaction.editReply({
        content: strings.bot.common.errors.uncaught_error,
        components,
      });
    }
  }
}
