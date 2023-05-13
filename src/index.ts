import { Client, GatewayIntentBits } from 'discord.js';
import { registerErrorHandlers } from './behaviors/error.js';
import guildMemberAdd from './behaviors/guildMemberAdd.js';
import interactionCreate from './behaviors/interactionCreate.js';
import ready from './behaviors/ready.js';
import { args } from './core/process/args.js';

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

registerErrorHandlers();

client
  .on('ready', ready)
  .on('guildMemberAdd', guildMemberAdd)
  .on('interactionCreate', interactionCreate)
  .login(args['discord-token']);
