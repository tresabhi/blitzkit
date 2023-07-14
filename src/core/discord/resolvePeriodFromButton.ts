import { ButtonInteraction, CacheType } from 'discord.js';
import { CYCLIC_API } from '../../constants/cyclic';
import { RegionDomain } from '../../constants/regions';
import resolvePeriodFromURL from '../express/resolvePeriodFromURL';

export default function resolvePeriodFromButton(
  server: RegionDomain,
  interaction: ButtonInteraction<CacheType>,
) {
  return resolvePeriodFromURL(server, `${CYCLIC_API}/${interaction.customId}`);
}
