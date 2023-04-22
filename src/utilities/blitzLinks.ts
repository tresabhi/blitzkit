import { PlayerStatistics } from '../types/statistics.js';

export default function blitzLinks(data: PlayerStatistics) {
  return `[View full stats](https://www.blitzstars.com/player/${data.region}/${data.nickname}) • [Support BlitzStars](https://www.blitzstars.com/supporters)`;
}
