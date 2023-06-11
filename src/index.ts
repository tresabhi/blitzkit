import { Client, GatewayIntentBits } from 'discord.js';
import { discordToken } from './core/process/args.js';
import { registerErrorHandlers } from './events/error.js';
import guildMemberAdd from './events/guildMemberAdd.js';
import interactionCreate from './events/interactionCreate.js';
import ready from './events/ready.js';

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
})
  .on('ready', ready)
  .on('guildMemberAdd', guildMemberAdd)
  .on('interactionCreate', interactionCreate);

registerErrorHandlers();
client.login(discordToken);

console.log(process.env);
