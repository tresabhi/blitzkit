import { BlitzServer } from '../constants/servers.js';
import resolvePeriodFromCommand from '../core/discord/resolvePeriodFromCommand.js';
import stats, { StatType } from '../renderers/stats.js';
import { ResponderRegistry } from '../server.js';

export default {
  route: '/stats/:type/:period',
  inProduction: true,
  inDevelopment: true,

  async handler(req) {
    console.log('yeah');

    return await stats(
      req.params.type as StatType,
      resolvePeriodFromCommand(req),
      {
        server: req.query.server as BlitzServer,
        id: parseInt(req.query.id as string),
      },
      parseInt(req.query.tank as string),
    );
  },
} satisfies ResponderRegistry;
