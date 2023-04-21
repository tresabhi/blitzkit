import {
  CacheType,
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

export interface CommandRegistry {
  disabled?: boolean;
  data: SlashCommandBuilder;
  execute: (interaction: Interaction) => void;
}

const commandCollection = new Collection<string, CommandRegistry>();
const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const commandFolders = readdirSync('src/commands/');
const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

for (const file of commandFolders) {
  const command = (await import(`../commands/${file}`)) as CommandRegistry;

  if (!command.disabled) {
    commands.push(command.data.toJSON());
    commandCollection.set(command.data.name, command);
  }
}

try {
  console.log(`Started refreshing ${commands.length} command(s).`);

  const data = (await rest.put(
    Routes.applicationGuildCommands(getClientId(), discord.guild_id),
    { body: commands },
  )) as { length: number };

  console.log(`Successfully reloaded ${data.length} command(s).`);
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
