import { ShardingManager } from 'discord.js';
import { secrets } from '../blitzkrieg/secrets';

export const manager = new ShardingManager(`${__dirname}/bot.cjs`, {
  token: secrets.DISCORD_TOKEN,
});
