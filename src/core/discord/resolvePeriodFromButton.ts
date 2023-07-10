import { ButtonInteraction, CacheType } from 'discord.js';
import { CYCLIC_API } from '../../constants/cyclic.js';
import { BlitzServer } from '../../constants/servers.js';
import resolvePeriodFromURL from '../express/resolvePeriodFromURL.js';

export default function resolvePeriodFromButton(
  server: BlitzServer,
  interaction: ButtonInteraction<CacheType>,
) {
  return resolvePeriodFromURL(server, `${CYCLIC_API}/${interaction.customId}`);
}
