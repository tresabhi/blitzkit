import { ButtonInteraction, CacheType } from 'discord.js';
import { CYCLIC_API } from '../../constants/cyclic';
import { Region } from '../../constants/regions';
import resolvePeriodFromURL from './resolvePeriodFromURL';

export default function resolvePeriodFromButton(
  server: Region,
  interaction: ButtonInteraction<CacheType>,
) {
  return resolvePeriodFromURL(server, `${CYCLIC_API}/${interaction.customId}`);
}
