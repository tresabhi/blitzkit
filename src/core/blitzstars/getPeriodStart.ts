import { StatPeriod } from '../options/addPeriodChoices.js';
import getPeriodStartFromDaysAgo from './getPeriodStartFromDaysAgo.js';

export default function getPeriodicStart(period: StatPeriod) {
  if (period === 'career') {
    return -Infinity;
  } else if (period === 'today') {
    const now = new Date();
    now.setHours(5, 0, 0, 0);

    // If it's after 5:00 AM today, subtract one day
    if (now.getTime() > Date.now()) now.setDate(now.getDate() - 1);

    return now.getTime() / 1000;
  } else {
    return getPeriodStartFromDaysAgo(Number(period));
  }
}
