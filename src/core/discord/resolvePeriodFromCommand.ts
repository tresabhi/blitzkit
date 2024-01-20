import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { Region } from '../../constants/regions';
import getPeriodNow from '../blitzkrieg/getPeriodNow';
import getPeriodStart from '../blitzkrieg/getPeriodStart';
import getTimeDaysAgo from '../blitzkrieg/getTimeDaysAgo';
import { PeriodSize, PeriodType } from './addPeriodSubCommands';

export function getPeriodOptionName(period: PeriodSize) {
  if (period === 'career') return 'Career';
  if (period === 'today') return 'Today';
  return `${period} days`;
}

export interface ResolvedPeriod {
  name: string;
  start: number;
  end: number;
}

export default function resolvePeriodFromCommand(
  region: Region,
  interaction: ChatInputCommandInteraction<CacheType>,
  forcedPeriod?: PeriodType,
) {
  let name: string;
  let start: number;
  let end: number;
  const periodSubcommand = forcedPeriod
    ? forcedPeriod
    : (interaction.options.getSubcommand() as PeriodType);

  if (periodSubcommand === 'custom') {
    const startOption = interaction.options.getInteger('start', true);
    const endOption = interaction.options.getInteger('end', true);
    const startDaysAgoMin = Math.min(startOption, endOption);
    const endDaysAgoMax = Math.max(startOption, endOption);

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
