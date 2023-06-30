import { ButtonInteraction, CacheType } from 'discord.js';
import { CYCLIC_API } from '../../../constants/cyclic.js';
import normalizeInteractionReturnable from '../../../core/discord/normalizeInteractionReturnable.js';
import throwError from '../../../core/node/throwError.js';
import { commands } from '../index.js';

export default async function handleButton(
  interaction: ButtonInteraction<CacheType>,
) {
  await interaction.deferUpdate();

  const url = new URL(`${CYCLIC_API}/${interaction.customId}`);
  const commandName = url.pathname.split('/')[1];
  const button = commands[commandName]?.button;

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
