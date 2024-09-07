import { ShardingManager } from 'discord.js';
import { assertSecret } from '../../../packages/core/src/blitzkit/assertSecret';

export const manager = new ShardingManager('dist/bot/workers/bot.js', {
  token: assertSecret(process.env.DISCORD_TOKEN),
});
