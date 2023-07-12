import { Client, GatewayIntentBits } from 'discord.js';
import { DISCORD_TOKEN } from './core/node/arguments';
import { registerErrorHandlers } from './events/error';
import guildMemberAdd from './events/guildMemberAdd';
import interactionCreate from './events/interactionCreate';
import ready from './events/ready';

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
})
  .on('ready', ready)
  .on('guildMemberAdd', guildMemberAdd)
  .on('interactionCreate', interactionCreate);

registerErrorHandlers();
client.login(DISCORD_TOKEN);
