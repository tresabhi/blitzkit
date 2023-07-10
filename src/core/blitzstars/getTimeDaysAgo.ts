import { BlitzServer } from '../../constants/servers.js';

export const TIME_ZONE_MAPPINGS: Record<BlitzServer, number> = {
  com: -5, // Central North American Time
  eu: +1, // Central European Time
  asia: +7, // Central Asia Standard Time
};

export default function getTimeDaysAgo(server: BlitzServer, daysAgo: number) {
  const now = new Date();
  if (daysAgo === 0) now.getTime() / 1000;

  const time = new Date();

  time.setUTCHours(-TIME_ZONE_MAPPINGS[server] + 5, 0, 0, 0);
  if (time > now) time.setUTCDate(time.getUTCDate() - 1);
  time.setUTCDate(time.getUTCDate() - daysAgo + 1);

  return time.getTime() / 1000;
}
