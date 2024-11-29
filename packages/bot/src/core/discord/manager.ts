import { assertSecret } from '@blitzkit/core';
import { ShardingManager } from 'discord.js';

export const manager = new ShardingManager('dist/bot/workers/bot.js', {
  token: assertSecret(import.meta.env.DISCORD_TOKEN),
});
