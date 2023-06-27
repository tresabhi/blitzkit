import {
  ButtonInteraction,
  CacheType,
  ChatInputCommandInteraction,
} from 'discord.js';
import { Request } from 'express';
import { CYCLIC_API } from '../../constants/cyclic.js';
import getPeriodNow from '../blitzstars/getPeriodNow.js';
import getPeriodStart from '../blitzstars/getPeriodStart.js';
import getTimeDaysAgo from '../blitzstars/getTimeDaysAgo.js';
import { Period } from '../options/addPeriodSubCommands.js';

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
  input:
    | ChatInputCommandInteraction<CacheType>
    | ButtonInteraction<CacheType>
    | Request,
) {
  let statsName: string;
  let evolutionName: string;
  let start: number;
  let end: number;
  let url: URL;
  let period: Period;

  if (input instanceof ChatInputCommandInteraction) {
    period = input.options.getSubcommand() as Period;
  } else {
    url = new URL(
      `${CYCLIC_API}${
        input instanceof ButtonInteraction ? `/${input.customId}` : input.path
      }`,
    );
    const path = url.pathname.split('/').filter(Boolean);
    period = path[path.length - 1] as Period;
  }

  if (period === 'custom') {
    const startRaw =
      input instanceof ChatInputCommandInteraction
        ? input.options.getInteger('start')!
        : parseInt(url!.searchParams.get('start')!);
    const endRaw =
      input instanceof ChatInputCommandInteraction
        ? input.options.getInteger('end')!
        : parseInt(url!.searchParams.get('end')!);
    const startMin = Math.min(startRaw, endRaw);
    const endMax = Math.max(startRaw, endRaw);

    statsName = `${startMin} to ${endMax} days' statistics`;
    evolutionName = `${startMin} to ${endMax} days' evolution`;
    start = getTimeDaysAgo(startMin);
    end = getTimeDaysAgo(endMax);
  } else {
    statsName = PERIOD_NAMES[period];
    evolutionName = EVOLUTION_PERIOD_NAMES[period];
    start = getPeriodStart(period);
    end = getPeriodNow();
  }

  return {
    statsName,
    evolutionName,
    start,
    end,
  } satisfies ResolvedPeriod;
}
