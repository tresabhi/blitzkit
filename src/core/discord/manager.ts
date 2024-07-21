import { ShardingManager } from 'discord.js';
import { secrets } from '../blitzkit/secrets';

export const manager = new ShardingManager('dist/bot/workers/bot.js', {
  token: secrets.DISCORD_TOKEN,
});
