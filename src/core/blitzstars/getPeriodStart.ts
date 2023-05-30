import { StatPeriod } from '../options/addStatPeriodChoices.js';

export default function getPeriodicStart(period: StatPeriod) {
  if (period === 'career') {
    return -Infinity;
  } else {
    const daysAgo = period === 'today' ? 0 : Number(period) - 1;
    const periodStart = new Date();

    periodStart.setDate(periodStart.getDate() - daysAgo);
    periodStart.setHours(5, 0, 0, 0);

    return periodStart.getTime() / 1000;
  }
}
