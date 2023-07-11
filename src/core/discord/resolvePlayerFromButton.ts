import { ButtonInteraction, CacheType } from 'discord.js';
import { CYCLIC_API } from '../../constants/cyclic';
import resolvePlayerFromURL from '../express/resolvePlayerFromURL';

export default async function resolvePlayerFromButton(
  interaction: ButtonInteraction<CacheType>,
) {
  return resolvePlayerFromURL(`${CYCLIC_API}/${interaction.customId}`);
}
