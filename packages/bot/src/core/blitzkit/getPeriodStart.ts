import { Region } from '@blitzkit/core';
import getTimeDaysAgo from '../../../../website/src/core/blitzkit/getTimeDaysAgo';
import { PeriodSize } from '../discord/addPeriodSubCommands';

export default function getPeriodStart(region: Region, period: PeriodSize) {
  if (period === 'career') return 0;
  if (period === 'today') return getTimeDaysAgo(region, 1);
  return getTimeDaysAgo(region, parseInt(period));
}
