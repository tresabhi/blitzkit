import { faker } from '@faker-js/faker';
import { Client, EmbedBuilder, GatewayIntentBits } from 'discord.js';
import config from '../config.json' assert { type: 'json' };

const VERIFY_CHANNEL = '1097677884266643527';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.on('error', console.error);
client.on('ready', (c) => console.log(`Logged in as ${client.user.tag}!`));

client.on('guildMemberAdd', (member) => {
  member.guild.channels.cache.get(VERIFY_CHANNEL).send({
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

client.login(config.token);
