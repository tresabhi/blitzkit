import { BlitzServer } from '../constants/servers.js';
import resolvePeriodFromRequest from '../core/express/resolvePeriodFromRequest.js';
import stats, { StatType } from '../renderers/stats.js';
import { ResponderRegistry } from '../server.js';

export default {
  route: '/stats/:type/:period',
  inProduction: true,
  inDevelopment: true,

  async handler(req) {
    const type = req.params.type as StatType;
    const period = resolvePeriodFromRequest(req);

    return await stats(
      type,
      period,
      {
        server: req.query.server as BlitzServer,
        id: parseInt(req.query.id as string),
      },
      parseInt(req.query.tank as string),
    );
  },
} satisfies ResponderRegistry;
