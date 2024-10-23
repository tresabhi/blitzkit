import { getTimeDaysAgo, Region } from '@blitzkit/core';
import { PeriodSize } from '../discord/addPeriodSubCommands';

export function getPeriodStart(region: Region, period: PeriodSize) {
  if (period === 'career') return 0;
  if (period === 'today') return getTimeDaysAgo(region, 1);
  return getTimeDaysAgo(region, parseInt(period));
}
