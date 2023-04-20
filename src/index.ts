import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import guildMemberAdd from './behaviors/guildMemberAdd.js';
import interactionCreate from './behaviors/interactionCreate.js';
import ready from './behaviors/ready.js';
import tokenRequirements from './utilities/tokenRequirements.js';

config();
tokenRequirements();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.on('error', console.error);
client.on('ready', ready);
client.on('guildMemberAdd', guildMemberAdd);
client.on('interactionCreate', interactionCreate);
client.login(process.env.DISCORD_TOKEN);
