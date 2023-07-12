import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
} from 'discord.js';
import { commands } from '..';
import embedNegative from '../../../core/discord/embedNegative';
import embedWarning from '../../../core/discord/embedWarning';
import normalizeInteractionReturnable from '../../../core/discord/normalizeInteractionReturnable';
import { psa } from '../../../core/discord/psa';
import { handleError } from '../../error';

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
