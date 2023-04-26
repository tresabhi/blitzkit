import { Client, GatewayIntentBits } from 'discord.js';
import cleanup, { EXIT_EVENT_NAMES } from './behaviors/cleanup.js';
import guildMemberAdd from './behaviors/guildMemberAdd.js';
import interactionCreate from './behaviors/interactionCreate.js';
import ready from './behaviors/ready.js';
import tokenRequirements from './utilities/tokenRequirements.js';

tokenRequirements();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.on('error', console.error);
client.on('ready', ready);
client.on('guildMemberAdd', guildMemberAdd);
client.on('interactionCreate', interactionCreate);
client.login(process.env.DISCORD_TOKEN);

EXIT_EVENT_NAMES.forEach((exitEventName) =>
  process.on(exitEventName, () => cleanup(client)),
);
