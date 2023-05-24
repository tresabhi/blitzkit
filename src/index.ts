import { chromium } from '@playwright/test';
import { Client, GatewayIntentBits } from 'discord.js';
import { args } from './core/process/args.js';
import { registerErrorHandlers } from './events/error.js';
import guildMemberAdd from './events/guildMemberAdd.js';
import interactionCreate from './events/interactionCreate.js';
import ready from './events/ready.js';

registerErrorHandlers();

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
export const browser = await chromium.launch();

client
  .on('ready', ready)
  .on('guildMemberAdd', guildMemberAdd)
  .on('interactionCreate', interactionCreate)
  .login(args['discord-token']);
