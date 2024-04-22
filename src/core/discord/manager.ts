import { ShardingManager } from 'discord.js';
import { secrets } from '../blitzrinth/secrets';

export const manager = new ShardingManager(`${__dirname}/bot.cjs`, {
  token: secrets.DISCORD_TOKEN,
});
