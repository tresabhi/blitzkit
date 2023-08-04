import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
} from 'discord.js';
import { commands } from '..';
import discord from '../../../../discord.json' assert { type: 'json' };
import embedNegative from '../../../core/discord/embedNegative';
import embedWarning from '../../../core/discord/embedWarning';
import normalizeInteractionReturnable from '../../../core/discord/normalizeInteractionReturnable';
import { psa } from '../../../core/discord/psa';
import { handleError } from '../../error';

export default async function handleChatInputCommand(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  const registry = (await commands)[interaction.commandName];

  console.log(interaction.toString());
  await interaction.deferReply();

  try {
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

    const returnable = await registry.handler(interaction);

    if (registry.handlesInteraction) return;

    const reply = await normalizeInteractionReturnable(returnable!);

    if (psa.data) {
      if (!reply.embeds) reply.embeds = [];
      reply.embeds.push(embedWarning(psa.data.title, psa.data.description));
    }

    await interaction.editReply(reply);
  } catch (error) {
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Get Help on Discord Server')
        .setURL('https://discord.gg/nDt7AjGJQH')
        .setStyle(ButtonStyle.Link),
    );

    await interaction.editReply({
      embeds: [
        embedNegative(
          (error as Error).message,
          `${(error as Error).cause ?? 'No further information is available.'}`,
        ),
      ],
      components: [actionRow],
    });

    handleError(error as Error, interaction.commandName);
  }
}
