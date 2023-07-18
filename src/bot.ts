import { Octokit } from '@octokit/rest';
import { Client, GatewayIntentBits } from 'discord.js';
import { secrets } from './core/node/secrets';
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

export const octokit = new Octokit({ auth: secrets.GH_TOKEN });

registerErrorHandlers();
client.login(secrets.DISCORD_TOKEN);
