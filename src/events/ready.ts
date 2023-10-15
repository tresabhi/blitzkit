import { Client } from 'discord.js';

export default function ready(client: Client<true>) {
  console.log(`🟢 Bot ${client.shard?.ids[0]} launched`);
}
