import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { BlitzServer } from '../../constants/servers';
import getPeriodNow from '../blitzstars/getPeriodNow';
import getPeriodStart from '../blitzstars/getPeriodStart';
import getTimeDaysAgo from '../blitzstars/getTimeDaysAgo';
import { Period } from '../discord/addPeriodSubCommands';

export const PERIOD_NAMES: Record<Period, string> = {
  today: "Today's statistics",
  30: "30 days' statistics",
  60: "60 days' statistics",
  90: "90 days' statistics",
  career: 'Career statistics',
  custom: 'Custom period',
};

export const EVOLUTION_PERIOD_NAMES: Record<Period, string> = {
  today: "Today's evolution",
  30: "30 days' evolution",
  60: "60 days' evolution",
  90: "90 days' evolution",
  career: 'Career evolution',
  custom: 'Custom period',
};

export interface ResolvedPeriod {
  statsName: string;
  evolutionName: string;
  start: number;
  end: number;
}

export default function resolvePeriodFromCommand(
  server: BlitzServer,
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  let statsName: string;
  let evolutionName: string;
  let start: number;
  let end: number;
  const period = interaction.options.getSubcommand() as Period;

  if (period === 'custom') {
    const startRaw = interaction.options.getInteger('start')!;
    const endRaw = interaction.options.getInteger('end')!;
    const startMin = Math.min(startRaw, endRaw);
    const endMax = Math.max(startRaw, endRaw);

    statsName = `${startMin} to ${endMax} days' statistics`;
    evolutionName = `${startMin} to ${endMax} days' evolution`;
    start = getTimeDaysAgo(server, startMin);
    end = getTimeDaysAgo(server, endMax);
  } else {
    statsName = PERIOD_NAMES[period];
    evolutionName = EVOLUTION_PERIOD_NAMES[period];
    start = getPeriodStart(server, period);
    end = getPeriodNow();
  }

  return {
    statsName,
    evolutionName,
    start,
    end,
  } satisfies ResolvedPeriod;
}
