import { Client, GatewayIntentBits } from 'discord.js';
import { DISCORD_TOKEN } from './core/process/args.js';
import { registerErrorHandlers } from './events/error.js';
import guildMemberAdd from './events/guildMemberAdd.js';
import interactionCreate from './events/interactionCreate/index.js';
import ready from './events/ready.js';

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
})
  .on('ready', ready)
  .on('guildMemberAdd', guildMemberAdd)
  .on('interactionCreate', interactionCreate);

registerErrorHandlers();
client.login(DISCORD_TOKEN);
