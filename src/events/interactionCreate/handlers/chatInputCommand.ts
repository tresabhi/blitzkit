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
import buttonLink from '../../../core/discord/buttonLink';
import embedWarning from '../../../core/discord/embedWarning';
import normalizeInteractionReturnable from '../../../core/discord/normalizeInteractionReturnable';
import { psa } from '../../../core/discord/psa';
import { translator } from '../../../core/localization/translator';
import { UserError } from '../../../hooks/userError';

export default async function handleChatInputCommand(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  const awaitedCommands = await commands;
  const registry = awaitedCommands[interaction.commandName];

  await interaction.deferReply();

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
    const { t } = translator(interaction.locale);
    const components = [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel(t`bot.common.errors.get_help`)
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
        content: t`bot.common.errors.uncaught_error`,
        components,
      });
    }
  }
}
