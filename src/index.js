import { faker } from '@faker-js/faker';
import {
  Client,
  Collection,
  EmbedBuilder,
  GatewayIntentBits,
  REST,
  Routes,
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

client.on('guildMemberAdd', (member) => {
  member.guild.channels.cache.get(config.verifyChannel)?.send({
    embeds: [
      new EmbedBuilder()
        .setColor('#8e3cf5')
        .setTitle(`Welcome ${member.user.username}`)
        .setDescription(
          `Welcome to the Skilled server, ${member.toString()}! To continue, please use the \`/verify\` command.\n\nExample: \`/verify ${faker.name.firstName()}${faker.datatype.number(
            { min: 1, max: 100 },
          )}\``,
        ),
    ],
  });
});

client.commands = new Collection();

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
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
  client.commands.set(command.data.name, command);
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.token);

try {
  console.log(`Started refreshing ${commands.length} command(s).`);

  const data = await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: commands },
  );

  console.log(`Successfully reloaded ${data.length} command(s).`);
} catch (error) {
  console.error(error);
}

client.login(config.token);
