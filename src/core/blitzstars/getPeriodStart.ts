import { Region } from '../../constants/regions';
import { PeriodOption } from '../discord/addPeriodSubCommands';
import getTimeDaysAgo from './getTimeDaysAgo';

export default function getPeriodStart(region: Region, period: PeriodOption) {
  return period === 'career' ? 0 : getTimeDaysAgo(region, parseInt(period));
}
