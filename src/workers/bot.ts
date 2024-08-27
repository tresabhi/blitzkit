import { registerProcesses } from '../core/blitzkit/processes';
import { assertSecrete } from '../core/blitzkit/secrete';
import { client } from '../core/discord/client';

console.log(`🟡 Launching bot ${client.shard?.ids[0]}`);

registerProcesses();

client.login(assertSecrete(process.env.DISCORD_TOKEN));
