import { registerProcesses } from '../core/blitzkit/processes';
import { secrets } from '../core/blitzkit/secrets';
import { client } from '../core/discord/client';

console.log(`🟡 Launching bot ${client.shard?.ids[0]}`);

registerProcesses();
client.login(secrets.DISCORD_TOKEN);
