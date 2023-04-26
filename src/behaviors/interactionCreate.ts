import {
  CacheType,
  ChatInputCommandInteraction,
  Collection,
  Interaction,
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';
import { readdirSync } from 'fs';
import discord from '../../discord.json' assert { type: 'json' };
import getClientId from '../utilities/getClientId.js';
import isDev from '../utilities/isDev.js';

export interface CommandRegistry {
  inDevelopment: boolean; // register with Skilled Bot (default: false)
  inProduction: boolean; // register with Skilled Canary (default: false)
  inPublic: boolean; // registers on all servers (default: true)

  command: Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: (interaction: ChatInputCommandInteraction<CacheType>) => void;
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);
const commandFolders = readdirSync('src/commands/');
const commandCollection = new Collection<string, CommandRegistry>();
const guildCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const publicCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

for (const file of commandFolders) {
  const command = (await import(`../commands/${file}`))
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
  console.log(`Refreshing ${guildCommands.length} guild command(s).`);

  const guildData = (await rest.put(
    Routes.applicationGuildCommands(getClientId(), discord.guild_id),
    { body: guildCommands },
  )) as RESTPostAPIChatInputApplicationCommandsJSONBody[];

  console.log(`Successfully refreshed ${guildData.length} guild command(s).`);

  console.log(`Refreshing ${publicCommands.length} public command(s).`);

  const publicData = (await rest.put(
    Routes.applicationCommands(getClientId()),
    { body: publicCommands },
  )) as RESTPostAPIChatInputApplicationCommandsJSONBody[];

  console.log(`Successfully refreshed ${publicData.length} public command(s).`);
} catch (error) {
  console.error(error);
}

export default async function interactionCreate(
  interaction: Interaction<CacheType>,
) {
  if (!interaction.isChatInputCommand()) return;
  const command = commandCollection.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  }
}
