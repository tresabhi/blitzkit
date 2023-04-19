import { faker } from '@faker-js/faker';
import {
  Client,
  Collection,
  EmbedBuilder,
  GatewayIntentBits,
  Interaction,
  REST,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';
import { readdirSync } from 'fs';
import config from '../config.json' assert { type: 'json' };

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.on('error', console.error);
client.on('ready', (c) => {
  console.log(`Logged in as ${c.user.tag}!`);
});

client.on('guildMemberAdd', async (member) => {
  console.log(`${member.user.tag} joined`);

  //@ts-ignore
  await member.guild.channels.cache.get(config.discord_verify_channel)?.send({
    embeds: [
      new EmbedBuilder()
        .setColor('#8e3cf5')
        .setTitle(`Welcome ${member.user.username}`)
        .setDescription(
          `Welcome to the Skilled server, **${
            member.user.username
          }**! To continue, please use the \`/verify\` command.\n\nExample: \`/verify NA ${faker.name.firstName()}${faker.datatype.number(
            { min: 1, max: 100 },
          )}\``,
        ),
    ],
  });
  await member.guild.channels.cache
    .get(config.discord_verify_channel)
    //@ts-ignore
    ?.send(member.toString());
});

export interface CommandRegistry {
  data: SlashCommandBuilder;
  execute: (interaction: Interaction) => void;
}

const commandCollection = new Collection<string, CommandRegistry>();

client.on('interactionCreate', async (interaction: Interaction) => {
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
});

const commands = [];
const foldersPath = 'src/commands/';
const commandFolders = readdirSync(foldersPath);

for (const file of commandFolders) {
  const command = await import(`./commands/${file}`);
  commands.push(command.data.toJSON());
  commandCollection.set(command.data.name, command);
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.discord_token);

try {
  console.log(`Started refreshing ${commands.length} command(s).`);

  const data = (await rest.put(
    Routes.applicationGuildCommands(
      config.discord_client_id,
      config.discord_guild_id,
    ),
    { body: commands },
  )) as { length: number };

  console.log(`Successfully reloaded ${data.length} command(s).`);
} catch (error) {
  console.error(error);
}

client.login(config.discord_token);
