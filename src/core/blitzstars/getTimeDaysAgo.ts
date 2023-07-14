import { RegionDomain } from '../../constants/regions';

export const TIME_ZONE_MAPPINGS: Record<RegionDomain, number> = {
  com: -5, // Central North American Time
  eu: +1, // Central European Time
  asia: +7, // Central Asia Standard Time
};

export default function getTimeDaysAgo(server: RegionDomain, daysAgo: number) {
  const now = new Date();
  if (daysAgo === 0) now.getTime() / 1000;

  const time = new Date();

  time.setUTCHours(-TIME_ZONE_MAPPINGS[server], 0, 0, 0);
  if (time > now) time.setUTCDate(time.getUTCDate() - 1);
  time.setUTCDate(time.getUTCDate() - daysAgo + 1);

  return time.getTime() / 1000;
}
