import { BlitzServer } from '../../constants/servers';
import getPeriodNow from '../blitzstars/getPeriodNow';
import getPeriodStart from '../blitzstars/getPeriodStart';
import getTimeDaysAgo from '../blitzstars/getTimeDaysAgo';
import { Period } from '../discord/addPeriodSubCommands';
import {
  EVOLUTION_PERIOD_NAMES,
  PERIOD_NAMES,
  ResolvedPeriod,
} from '../discord/resolvePeriodFromCommand';

export default function resolvePeriodFromURL(
  server: BlitzServer,
  urlString: string,
) {
  let statsName: string;
  let evolutionName: string;
  let start: number;
  let end: number;
  const url = new URL(urlString);
  const path = url.pathname.split('/').filter(Boolean);
  const period = path[path.length - 1] as Period;

  if (period === 'custom') {
    const startRaw = parseInt(url!.searchParams.get('start')!);
    const endRaw = parseInt(url!.searchParams.get('end')!);
    const startMin = Math.min(startRaw, endRaw);
    const endMax = Math.max(startRaw, endRaw);

    statsName = `${startMin} to ${endMax} days' statistics`;
    evolutionName = `${startMin} to ${endMax} days' evolution`;
    start = getTimeDaysAgo(server, startMin);
    end = getTimeDaysAgo(server, endMax);
  } else {
    statsName = PERIOD_NAMES[period];
    evolutionName = EVOLUTION_PERIOD_NAMES[period];
    start = getPeriodStart(server, period);
    end = getPeriodNow();
  }

  return {
    statsName,
    evolutionName,
    start,
    end,
  } satisfies ResolvedPeriod;
}
