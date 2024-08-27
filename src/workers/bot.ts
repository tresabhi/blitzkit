import { registerProcesses } from '../core/blitzkit/processes';
import { assertSecret } from '../core/blitzkit/secret';
import { client } from '../core/discord/client';

console.log(`🟡 Launching bot ${client.shard?.ids[0]}`);

registerProcesses();

client.login(assertSecret(process.env.DISCORD_TOKEN));
