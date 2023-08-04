import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { Region } from '../../constants/regions';
import getPeriodNow from '../blitzstars/getPeriodNow';
import getPeriodStart from '../blitzstars/getPeriodStart';
import getTimeDaysAgo from '../blitzstars/getTimeDaysAgo';
import { PeriodSize, PeriodType } from '../discord/addPeriodSubCommands';

export function getPeriodOptionName(period: PeriodSize) {
  return period === 'career' ? 'Career' : `${period}-day`;
}

export interface ResolvedPeriod {
  statsName: string;
  evolutionName: string;
  start: number;
  end: number;
}

export default function resolvePeriodFromCommand(
  server: Region,
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  let statsName: string;
  let evolutionName: string;
  let start: number;
  let end: number;
  const periodSubcommand = interaction.options.getSubcommand() as PeriodType;
  const periodOption = interaction.options.getString('period') as PeriodSize;

  if (periodSubcommand === 'custom') {
    const startRaw = interaction.options.getInteger('start')!;
    const endRaw = interaction.options.getInteger('end')!;
    const startMin = Math.min(startRaw, endRaw);
    const endMax = Math.max(startRaw, endRaw);

    statsName = `${startMin} to ${endMax} days' statistics`;
    evolutionName = `${startMin} to ${endMax} days' evolution`;
    start = getTimeDaysAgo(server, startMin);
    end = getTimeDaysAgo(server, endMax);
  } else {
    statsName = `${getPeriodOptionName(periodOption)} Statistics`;
    evolutionName = `${getPeriodOptionName(periodOption)} Evolution`;
    start = getPeriodStart(server, periodOption);
    end = getPeriodNow();
  }

  return {
    statsName,
    evolutionName,
    start,
    end,
  } satisfies ResolvedPeriod;
}
