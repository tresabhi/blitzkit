import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { Region } from '../../constants/regions';
import getPeriodNow from '../blitzstars/getPeriodNow';
import getPeriodStart from '../blitzstars/getPeriodStart';
import getTimeDaysAgo from '../blitzstars/getTimeDaysAgo';
import { PeriodSubcommand } from '../discord/addPeriodSubCommands';

export const PERIOD_NAMES: Record<PeriodSubcommand, string> = {
  period: "Preset period's statistics",
  custom: "Custom period's statistics",
};

export const EVOLUTION_PERIOD_NAMES: Record<PeriodSubcommand, string> = {
  period: "Preset period's evolution",
  custom: "Custom period's evolution",
};

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
  const period = interaction.options.getSubcommand() as PeriodSubcommand;

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
