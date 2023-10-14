import { client } from './LEGACY_core/discord/client';
import { registerProcesses } from './LEGACY_core/node/processes';
import { secrets } from './LEGACY_core/node/secrets';

registerProcesses();
client.login(secrets.DISCORD_TOKEN);
