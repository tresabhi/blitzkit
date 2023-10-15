import { registerProcesses } from './core/blitzkrieg/processes';
import { secrets } from './core/blitzkrieg/secrets';
import { client } from './core/discord/client';

console.log(`🟡 Launching bot ${client.shard?.ids[0]}`);

registerProcesses();
client.login(secrets.DISCORD_TOKEN);
