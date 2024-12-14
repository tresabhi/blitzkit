import { Client } from 'discord.js';

export function ready(client: Client<true>) {
  console.log(`🟢 Launched bot ${client.shard?.ids[0] ?? 'default'}`);
}
