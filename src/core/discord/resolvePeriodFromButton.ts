import { ButtonInteraction, CacheType } from 'discord.js';
import { CYCLIC_API } from '../../constants/cyclic';
import { BlitzServer } from '../../constants/servers';
import resolvePeriodFromURL from '../express/resolvePeriodFromURL';

export default function resolvePeriodFromButton(
  server: BlitzServer,
  interaction: ButtonInteraction<CacheType>,
) {
  return resolvePeriodFromURL(server, `${CYCLIC_API}/${interaction.customId}`);
}
