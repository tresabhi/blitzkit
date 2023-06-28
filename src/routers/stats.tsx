import resolvePeriodFromRequest from '../core/express/resolvePeriodFromRequest.js';
import resolvePlayerFromRequest from '../core/express/resolvePlayerFromRequest.js';
import stats, { StatType } from '../renderers/stats.js';
import { RouterRegistry } from '../server.js';

export default {
  route: '/stats/:type/:period',
  inProduction: true,
  inDevelopment: false,

  async handler(req) {
    const type = req.params.type as StatType;
    const period = resolvePeriodFromRequest(req);
    const player = resolvePlayerFromRequest(req);

    return await stats(
      type,
      period,
      player,
      parseInt(req.query.tankId as string),
      true,
    );
  },
} satisfies RouterRegistry;
