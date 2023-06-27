import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
} from 'discord.js';
import negativeEmbed from '../../../core/discord/negativeEmbed.js';
import normalizeInteractionReturnable from '../../../core/discord/normalizeInteractionReturnable.js';
import warningEmbed from '../../../core/discord/warningEmbed.js';
import { psa } from '../../../core/node/psa.js';
import { handleError } from '../../error.js';
import { commands } from '../index.js';

export default async function handleChatInputCommand(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  const registry = commands[interaction.commandName];

  console.log(interaction.toString());
  await interaction.deferReply();

  try {
    const returnable = await registry.handler(interaction);

    if (registry.handlesInteraction) return;

    const reply = await normalizeInteractionReturnable(returnable!);

    if (psa.data) {
      if (!reply.embeds) reply.embeds = [];
      reply.embeds.push(warningEmbed(psa.data.title, psa.data.description));
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
        negativeEmbed(
          (error as Error).message,
          `${(error as Error).cause ?? 'No further information is available.'}`,
        ),
      ],
      components: [actionRow],
    });

    handleError(error as Error, interaction.commandName);
  }
}
