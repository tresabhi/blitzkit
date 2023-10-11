import { ButtonInteraction, CacheType } from 'discord.js';
import resolvePlayerFromURL from './resolvePlayerFromURL';

export default async function resolvePlayerFromButton(
  interaction: ButtonInteraction<CacheType>,
) {
  return resolvePlayerFromURL(`https://exmaple.com/${interaction.customId}`);
}
