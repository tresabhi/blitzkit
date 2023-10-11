import { ButtonInteraction, CacheType } from 'discord.js';
import { Region } from '../../constants/regions';
import resolvePeriodFromURL from './resolvePeriodFromURL';

export default function resolvePeriodFromButton(
  server: Region,
  interaction: ButtonInteraction<CacheType>,
) {
  return resolvePeriodFromURL(
    server,
    `https://example.com/${interaction.customId}`,
  );
}
