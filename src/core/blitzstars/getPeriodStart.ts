import { Region } from '../../constants/regions';
import { PeriodSize } from '../discord/addPeriodSubCommands';
import getTimeDaysAgo from './getTimeDaysAgo';

export default function getPeriodStart(region: Region, period: PeriodSize) {
  return period === 'career' ? 0 : getTimeDaysAgo(region, parseInt(period));
}
