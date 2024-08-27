import { ShardingManager } from 'discord.js';
import { assertSecrete } from '../blitzkit/secrete';

export const manager = new ShardingManager('dist/bot/workers/bot.js', {
  token: assertSecrete(process.env.DISCORD_TOKEN),
});
