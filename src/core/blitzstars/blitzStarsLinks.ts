import { BlitzServer } from '../../constants/servers.js';

export default function blitzStarsLinks(server: BlitzServer, nickname: string) {
  return `[View full stats](https://www.blitzstars.com/player/${server}/${nickname}) • [Support BlitzStars](https://www.blitzstars.com/supporters)`;
}
