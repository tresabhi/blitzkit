import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
} from 'discord.js';
import { commands } from '..';
import discord from '../../../../discord.json' assert { type: 'json' };
import { UserError } from '../../../core/blitzkrieg/userError';
import embedNegative from '../../../core/discord/embedNegative';
import embedWarning from '../../../core/discord/embedWarning';
import normalizeInteractionReturnable from '../../../core/discord/normalizeInteractionReturnable';
import { psa } from '../../../core/discord/psa';

export default async function handleChatInputCommand(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  const registry = (await commands)[interaction.commandName];

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

    if (psa.data) {
      if (!reply.embeds) reply.embeds = [];
      reply.embeds.push(embedWarning(psa.data.title, psa.data.description));
    }

    await interaction.editReply(reply);
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
