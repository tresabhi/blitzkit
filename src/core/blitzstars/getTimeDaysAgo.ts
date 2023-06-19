export default function getTimeDaysAgo(period: number) {
  const now = new Date();
  now.setHours(5, 0, 0, 0);

  // if it's after 5:00 AM today, subtract one day
  if (now.getTime() > Date.now()) now.setDate(now.getDate() - 1);

  // subtract the period number of days from now
  now.setDate(now.getDate() - period);

  return now.getTime() / 1000;
}
