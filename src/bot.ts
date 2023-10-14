import { registerProcesses } from './core/blitzkrieg/processes';
import { secrets } from './core/blitzkrieg/secrets';
import { client } from './core/discord/client';

registerProcesses();
client.login(secrets.DISCORD_TOKEN);
