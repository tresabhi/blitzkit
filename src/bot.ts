import { registerProcesses } from './core/blitzrinth/processes';
import { secrets } from './core/blitzrinth/secrets';
import { client } from './core/discord/client';

// console.log(`🟡 Launching bot ${client.shard?.ids[0]}`);

registerProcesses();
client.login(secrets.DISCORD_TOKEN);
