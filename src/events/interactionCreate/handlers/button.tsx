import { ButtonInteraction, CacheType } from 'discord.js';
import { commands } from '..';
import throwError from '../../../LEGACY_core/node/throwError';
import normalizeInteractionReturnable from '../../../core/discord/normalizeInteractionReturnable';

export default async function handleButton(
  interaction: ButtonInteraction<CacheType>,
) {
  await interaction.deferUpdate();

  const url = new URL(`https://example.com/${interaction.customId}`);
  const commandName = url.pathname.split('/')[1];
  const button = (await commands)[commandName]?.button;

  if (!button) {
    throwError(`Button handler not found for "${commandName}"`);
    return;
  }

  if (interaction.message.interaction?.user.id !== interaction.user.id) {
    interaction.followUp({
      ephemeral: true,
      content: 'You are not the author of this command.',
    });
    return;
  }

  await interaction.message.edit(
    await normalizeInteractionReturnable(button(interaction)),
  );
}
