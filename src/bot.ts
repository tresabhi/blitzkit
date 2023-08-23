import { client } from './core/discord/client';
import { secrets } from './core/node/secrets';
import { registerErrorHandlers } from './events/error';

registerErrorHandlers();
client.login(secrets.DISCORD_TOKEN);
