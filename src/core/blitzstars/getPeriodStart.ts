import { Region } from '../../constants/regions';
import { Period } from '../discord/addPeriodSubCommands';
import getTimeDaysAgo from './getTimeDaysAgo';

export default function getPeriodStart(
  server: Region,
  period: Exclude<Period, 'customperiod'>,
) {
  if (period === 'career') {
    return -Infinity;
  } else if (period === 'today') {
    return getTimeDaysAgo(server, 1);
  } else {
    return getTimeDaysAgo(server, parseInt(period.match(/\d+/)?.[0]!));
  }
}
