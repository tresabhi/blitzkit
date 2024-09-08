import { Locale } from 'discord.js';
import { translator } from '../localization/translator';
import { PeriodSize } from './addPeriodSubCommands';

export function getPeriodOptionName(period: PeriodSize, locale: Locale) {
  const { translate } = translator(locale);
  if (period === 'career') return translate('bot.common.periods.career');
  if (period === 'today') return translate('bot.common.periods.today');
  return translate('bot.common.periods.days', [period]);
}
