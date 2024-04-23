import { ShardingManager } from 'discord.js';
import { secrets } from '../blitzkit/secrets';

export const manager = new ShardingManager(`${__dirname}/bot.cjs`, {
  token: secrets.DISCORD_TOKEN,
});
