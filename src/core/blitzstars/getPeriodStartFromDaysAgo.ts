export default function getPeriodStartFromDaysAgo(period: number) {
  const daysAgo = Number(period) - 1;
  const periodStart = new Date();

  periodStart.setDate(periodStart.getDate() - daysAgo);
  periodStart.setHours(5, 0, 0, 0);

  return periodStart.getTime() / 1000;
}
