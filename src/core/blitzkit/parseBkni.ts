import getWssPercentile, {
  WSS_COLORS,
  WssPercentile,
} from '../statistics/getWssPercentile';

export function parseBkni(bkni: number) {
  const bkniFraction = (bkni + 1) / 2;
  const bkniMetric = Math.round(bkniFraction * 200);
  const bkniPercentile = getWssPercentile(bkniMetric);
  const lastBkniPercentile = Math.max(0, bkniPercentile - 1) as WssPercentile;
  const bkniColor = WSS_COLORS[bkniPercentile];
  const lastBkniColor = WSS_COLORS[lastBkniPercentile];

  return {
    bkni,
    bkniFraction,
    bkniMetric,
    bkniPercentile,
    lastBkniPercentile,
    bkniColor,
    lastBkniColor,
  };
}
