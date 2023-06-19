import { Period } from '../options/addPeriodSubCommands.js';
import getTimeDaysAgo from './getTimeDaysAgo.js';

export default function getPeriodStart(period: Exclude<Period, 'custom'>) {
  if (period === 'career') {
    return -Infinity;
  } else if (period === 'today') {
    return getTimeDaysAgo(0);
  } else {
    return getTimeDaysAgo(Number(period));
  }
}
