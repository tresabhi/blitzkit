import { Client, GatewayIntentBits } from 'discord.js';
import { args } from './core/process/args.js';
import { registerErrorHandlers } from './events/error.js';
import guildMemberAdd from './events/guildMemberAdd.js';
import interactionCreate from './events/interactionCreate.js';
import ready from './events/ready.js';

// sudo apt-get install libatk-bridge2.0-0
// node node_modules/puppeteer/install.js

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
// export const browser = await launch({ headless: 'new' });
// export const page = await browser.newPage();

registerErrorHandlers();

client
  .on('ready', ready)
  .on('guildMemberAdd', guildMemberAdd)
  .on('interactionCreate', interactionCreate)
  .login(args['discord-token']);
