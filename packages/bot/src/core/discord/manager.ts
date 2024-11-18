import { assertSecret } from '@blitzkit/core';
import { ShardingManager } from 'discord.js';

export const manager = new ShardingManager('src/workers/bot.ts', {
  token: assertSecret(process.env.DISCORD_TOKEN),
});
