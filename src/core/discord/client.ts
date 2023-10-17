import { Client, GatewayIntentBits } from 'discord.js';
import guildMemberAdd from '../../events/guildMemberAdd';
import interactionCreate from '../../events/interactionCreate';

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
})
  // .on('ready', ready)
  .on('guildMemberAdd', guildMemberAdd)
  .on('interactionCreate', interactionCreate);
