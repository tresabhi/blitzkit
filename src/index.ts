import { Client, GatewayIntentBits } from 'discord.js';
import { registerErrorHandlers } from './behaviors/error.js';
import guildMemberAdd from './behaviors/guildMemberAdd.js';
import interactionCreate from './behaviors/interactionCreate.js';
import ready from './behaviors/ready.js';
import tokenRequirements from './utilities/tokenRequirements.js';

export const executionStart = new Date().getTime();

tokenRequirements();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

registerErrorHandlers(client)
  .on('ready', ready)
  .on('guildMemberAdd', guildMemberAdd)
  .on('interactionCreate', interactionCreate)
  .login(process.env.DISCORD_TOKEN);
