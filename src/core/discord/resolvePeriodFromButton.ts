import { ButtonInteraction, CacheType } from 'discord.js';
import { CYCLIC_API } from '../../constants/cyclic.js';
import resolvePeriodFromURL from '../express/resolvePeriodFromURL.js';

export default function resolvePeriodFromButton(
  interaction: ButtonInteraction<CacheType>,
) {
  return resolvePeriodFromURL(`${CYCLIC_API}/${interaction.customId}`);
}
