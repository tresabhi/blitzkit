import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { BlitzServer } from '../../constants/servers.js';

export default function fullBlitzStarsStats(
  server: BlitzServer,
  username: string,
) {
  return new ButtonBuilder()
    .setLabel('View on BlitzStars')
    .setURL(`https://www.blitzstars.com/player/${server}/${username}`)
    .setStyle(ButtonStyle.Link);
}
