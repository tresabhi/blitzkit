import { Region } from '../../constants/regions';
import { PeriodSize } from '../discord/addPeriodSubCommands';
import getTimeDaysAgo from './getTimeDaysAgo';

export default function getPeriodStart(region: Region, period: PeriodSize) {
  if (period === 'career') return 0;
  if (period === 'today') return getTimeDaysAgo(region, 1);
  return getTimeDaysAgo(region, parseInt(period));
}
