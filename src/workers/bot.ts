import { assertSecret } from '../../packages/core/src/blitzkit/assertSecret';
import { registerProcesses } from '../core/blitzkit/processes';
import { client } from '../core/discord/client';

console.log(`🟡 Launching bot ${client.shard?.ids[0]}`);

registerProcesses();

client.login(assertSecret(process.env.DISCORD_TOKEN));
