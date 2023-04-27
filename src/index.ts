import {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from 'discord.js';
import { readdirSync } from 'fs';
import discord from '../discord.json' assert { type: 'json' };
import { registerErrorHandlers } from './behaviors/error.js';
import guildMemberAdd from './behaviors/guildMemberAdd.js';
import interactionCreateCurry, {
  CommandRegistry,
} from './behaviors/interactionCreate.js';
import ready from './behaviors/ready.js';
import getClientId from './utilities/getClientId.js';
import isDev from './utilities/isDev.js';
import tokenRequirements from './utilities/tokenRequirements.js';

tokenRequirements();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

const commandFolders = readdirSync('src/commands/');
const commandCollection = new Collection<string, CommandRegistry>();
const guildCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const publicCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

for (const file of commandFolders) {
  const command = (await import(`./commands/${file}`))
    .default as CommandRegistry;

  if (isDev() ? command.inDevelopment : command.inProduction) {
    if (command.inPublic) {
      publicCommands.push(command.command.toJSON());
    } else {
      guildCommands.push(command.command.toJSON());
    }

    commandCollection.set(command.command.name, command);
  }
}

try {
  console.log(`Refreshing ${publicCommands.length} public command(s).`);
  const publicData = (await rest.put(
    Routes.applicationCommands(getClientId()),
    { body: publicCommands },
  )) as RESTPostAPIChatInputApplicationCommandsJSONBody[];
  console.log(`Successfully refreshed ${publicData.length} public command(s).`);

  console.log(`Refreshing ${guildCommands.length} guild command(s).`);
  const guildData = (await rest.put(
    Routes.applicationGuildCommands(getClientId(), discord.guild_id),
    { body: guildCommands },
  )) as RESTPostAPIChatInputApplicationCommandsJSONBody[];
  console.log(`Successfully refreshed ${guildData.length} guild command(s).`);
} catch (error) {
  console.error(error);
}

registerErrorHandlers(client)
  .on('ready', ready)
  .on('guildMemberAdd', guildMemberAdd)
  .on(
    'interactionCreate',
    interactionCreateCurry({
      commandCollection,
      guildCommands,
      publicCommands,
    }),
  )
  .login(process.env.DISCORD_TOKEN);
