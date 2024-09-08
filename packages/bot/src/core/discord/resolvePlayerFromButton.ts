import { Region } from '@blitzkit/core';
import { ButtonInteraction } from 'discord.js';
import { ResolvedPlayer } from './resolvePlayerFromCommand';

export default async function resolvePlayerFromButton(
  interaction: ButtonInteraction,
) {
  const url = new URL(`https://exmaple.com/${interaction.customId}`);

  return {
    id: parseInt(url.searchParams.get('id')!),
    region: url.searchParams.get('region') as Region,
  } satisfies ResolvedPlayer;
}
