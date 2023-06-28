import { ButtonInteraction, CacheType } from 'discord.js';
import { CYCLIC_API } from '../../../constants/cyclic.js';
import normalizeInteractionReturnable from '../../../core/discord/normalizeInteractionReturnable.js';
import { commands } from '../index.js';

export default async function handleButton(
  interaction: ButtonInteraction<CacheType>,
) {
  const url = new URL(`${CYCLIC_API}/${interaction.customId}`);
  const commandName = url.pathname.split('/')[1];
  const button = commands[commandName]?.button;

  if (!button) {
    console.error(`Button handler not found for "${commandName}"`);
    return;
  }

  await interaction.deferUpdate();
  await interaction.message.edit(
    await normalizeInteractionReturnable(button(interaction)),
  );
}
