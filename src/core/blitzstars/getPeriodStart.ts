import { BlitzServer } from '../../constants/servers.js';
import { Period } from '../discord/addPeriodSubCommands.js';
import getTimeDaysAgo from './getTimeDaysAgo.js';

export default function getPeriodStart(
  server: BlitzServer,
  period: Exclude<Period, 'custom'>,
) {
  if (period === 'career') {
    return -Infinity;
  } else if (period === 'today') {
    return getTimeDaysAgo(server, 1);
  } else {
    return getTimeDaysAgo(server, parseInt(period));
  }
}
