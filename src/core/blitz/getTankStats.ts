import { Locale } from 'discord.js';
import { Region } from '../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import { TanksStats } from '../../types/tanksStats';
import { translator } from '../localization/translator';
import fetchBlitz from './fetchBlitz';

export default async function getTankStats(
  region: Region,
  id: number,
  locale: Locale,
) {
  const { t } = translator(locale);
  const tankStats = await fetchBlitz<TanksStats>(
    `https://api.wotblitz.${region}/wotb/tanks/stats/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
  );

  return tankStats[id];
}
