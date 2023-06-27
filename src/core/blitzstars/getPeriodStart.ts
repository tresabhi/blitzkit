import { Period } from '../discord/addPeriodSubCommands.js';
import getTimeDaysAgo from './getTimeDaysAgo.js';

export default function getPeriodStart(period: Exclude<Period, 'custom'>) {
  if (period === 'career') {
    return -Infinity;
  } else if (period === 'today') {
    return getTimeDaysAgo(0);
  } else {
    return getTimeDaysAgo(parseInt(period));
  }
}
