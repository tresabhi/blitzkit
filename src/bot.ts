import { client } from './core/discord/client';
import { registerProcesses } from './core/node/processes';
import { secrets } from './core/node/secrets';

registerProcesses();
client.login(secrets.DISCORD_TOKEN);
