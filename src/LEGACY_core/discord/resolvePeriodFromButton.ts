import { ButtonInteraction } from 'discord.js';
import { Region } from '../../constants/regions';
import getPeriodNow from '../../core/blitzkrieg/getPeriodNow';
import getPeriodStart from '../../core/blitzkrieg/getPeriodStart';
import getTimeDaysAgo from '../../core/blitzkrieg/getTimeDaysAgo';
import { PeriodType } from '../../core/discord/addPeriodSubCommands';
import {
  ResolvedPeriod,
  getPeriodOptionName,
} from './resolvePeriodFromCommand';

export default function resolvePeriodFromButton(
  region: Region,
  interaction: ButtonInteraction,
) {
  let name: string;
  let start: number;
  let end: number;
  const url = new URL(`https://example.com/${interaction.customId}`);
  const path = url.pathname.split('/');
  const periodSubcommand = path.at(-1) as PeriodType;

  if (periodSubcommand === 'custom') {
    const startRaw = parseInt(url!.searchParams.get('start')!);
    const endRaw = parseInt(url!.searchParams.get('end')!);
    const startDaysAgoMin = Math.min(startRaw, endRaw);
    const endDaysAgoMax = Math.max(startRaw, endRaw);

    name = `${startDaysAgoMin} - ${endDaysAgoMax} days`;
    start = getTimeDaysAgo(region, endDaysAgoMax);
    end = getTimeDaysAgo(region, startDaysAgoMin);
  } else {
    name = getPeriodOptionName(periodSubcommand);
    start = getPeriodStart(region, periodSubcommand);
    end = getPeriodNow();
  }

  return {
    name,
    start,
    end,
  } satisfies ResolvedPeriod;
}
