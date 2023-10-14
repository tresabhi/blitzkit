import { PeriodSize } from '../../LEGACY_core/discord/addPeriodSubCommands';
import { Region } from '../../constants/regions';
import getTimeDaysAgo from './getTimeDaysAgo';

export default function getPeriodStart(region: Region, period: PeriodSize) {
  if (period === 'career') return 0;
  if (period === 'today') return getTimeDaysAgo(region, 1);
  return getTimeDaysAgo(region, parseInt(period));
}
