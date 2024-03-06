import { CacheType, ChatInputCommandInteraction, Locale } from 'discord.js';
import { Region } from '../../constants/regions';
import getPeriodNow from '../blitzkrieg/getPeriodNow';
import getPeriodStart from '../blitzkrieg/getPeriodStart';
import getTimeDaysAgo from '../blitzkrieg/getTimeDaysAgo';
import { translator } from '../localization/translator';
import { PeriodSize, PeriodType } from './addPeriodSubCommands';

export function getPeriodOptionName(period: PeriodSize, locale: Locale) {
  const { translate } = translator(locale);
  if (period === 'career') return translate('bot.common.periods.career');
  if (period === 'today') return translate('bot.common.periods.today');
  return translate('bot.common.periods.days', [period]);
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
  const { translate } = translator(interaction.locale);
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

    name = translate('bot.common.periods.custom', [
      `${startDaysAgoMin}`,
      `${endDaysAgoMax}`,
    ]);
    start = getTimeDaysAgo(region, endDaysAgoMax);
    end = getTimeDaysAgo(region, startDaysAgoMin);
  } else {
    name = getPeriodOptionName(periodSubcommand, interaction.locale);
    start = getPeriodStart(region, periodSubcommand);
    end = getPeriodNow();
  }

  return {
    name,
    start,
    end,
  } satisfies ResolvedPeriod;
}
