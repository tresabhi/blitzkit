import { Client } from 'discord.js';

export default function ready(client: Client<true>) {
  console.log(`🟢 Launched bot ${client.shard?.ids[0]}`);
}
