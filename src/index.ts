import { Client, GatewayIntentBits } from 'discord.js';
import config from '../config.json' assert { type: 'json' };
import guildMemberAdd from './behaviors/guildMemberAdd.js';
import interactionCreate from './behaviors/interactionCreate.js';
import ready from './behaviors/ready.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.on('error', console.error);
client.on('ready', ready);
client.on('guildMemberAdd', guildMemberAdd);
client.on('interactionCreate', interactionCreate);
client.login(config.discord_token);
