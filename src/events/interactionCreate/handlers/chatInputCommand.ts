import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  InteractionReplyOptions,
} from 'discord.js';
import { commands } from '..';
import discord from '../../../../discord.json' assert { type: 'json' };
import { UserError } from '../../../core/blitzkrieg/userError';
import buttonLink from '../../../core/discord/buttonLink';
import embedNegative from '../../../core/discord/embedNegative';
import embedWarning from '../../../core/discord/embedWarning';
import normalizeInteractionReturnable from '../../../core/discord/normalizeInteractionReturnable';
import { psa } from '../../../core/discord/psa';

export default async function handleChatInputCommand(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  const awaitedCommands = await commands;
  const registry = awaitedCommands[interaction.commandName];

  await interaction.deferReply();

  if (registry.inPreview && interaction.guildId !== discord.tres_guild_id) {
    interaction.editReply({
      embeds: [
        embedWarning(
          `\`/${registry.command.name}\` is in Public Preview`,
          '[Join the official Discord server](https://discord.gg/nDt7AjGJQH) to gain early access to this command before it is released to the public.',
        ),
      ],
    });

    return;
  }

  try {
    const returnable = await registry.handler(interaction);

    if (registry.handlesInteraction) return;

    const reply = await normalizeInteractionReturnable(returnable!);

    if (
      psa.data &&
      !psa.data.secret &&
      (psa.data.commands === undefined ||
        psa.data.commands.includes(interaction.commandName))
    ) {
      if (psa.data.type === 'embed') {
        if (!reply.embeds) reply.embeds = [];
        reply.embeds.push(embedWarning(psa.data.title, psa.data.description));
      } else {
        if (!reply.files) reply.files = [];
        reply.files.push(new AttachmentBuilder(psa.data.image));
        reply.content = reply.content ?? psa.data.title;
      }

      if (psa.data.links) {
        if (!reply.components?.[0]) {
          reply.components = [new ActionRowBuilder<ButtonBuilder>()];
        }

        (reply.components[0] as ActionRowBuilder<ButtonBuilder>).addComponents(
          psa.data.links.map(({ title, url }) => buttonLink(url, title)),
        );
      }
    }

    await interaction.editReply(reply);

    if (
      psa.data &&
      psa.data.secret &&
      (psa.data.commands === undefined ||
        psa.data.commands.includes(interaction.commandName))
    ) {
      const followUp: InteractionReplyOptions = {
        ephemeral: true,
      };

      if (psa.data.type === 'embed') {
        if (!followUp.embeds) followUp.embeds = [];
        followUp.embeds.push(
          embedWarning(psa.data.title, psa.data.description),
        );
      } else {
        if (!followUp.files) followUp.files = [];
        followUp.files.push(new AttachmentBuilder(psa.data.image));
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
  } catch (error) {
    const components = [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel('Get Help on Discord Server')
          .setURL('https://discord.gg/nDt7AjGJQH')
          .setStyle(ButtonStyle.Link),
      ),
    ];

    if (error instanceof UserError) {
      interaction.editReply({
        embeds: [
          embedNegative(
            error.message,
            (error.cause as string | undefined) ??
              'No further information is available.',
          ),
        ],
        components,
      });
    } else {
      console.error(interaction.commandName, error);

      interaction.editReply({
        embeds: [
          embedNegative(
            'Blitzkrieg ran into an error!',
            "We're so sorry about this. Feel free to [join the official Discord server](https://discord.gg/nDt7AjGJQH) to get help.",
          ),
        ],
        components,
      });
    }
  }
}
