import resolvePeriodFromRequest from '../core/express/resolvePeriodFromRequest.js';
import resolvePlayerFromRequest from '../core/express/resolvePlayerFromRequest.js';
import stats, { StatType } from '../renderers/stats.js';
import { RouteRegistry } from '../server.js';

export const statsRoute: RouteRegistry = {
  route: '/stats/:type/:period',
  inProduction: true,
  inDevelopment: false,

  async handler(req) {
    const type = req.params.type as StatType;
    const player = resolvePlayerFromRequest(req);
    const period = resolvePeriodFromRequest(player.server, req);

    return await stats(
      type,
      period,
      player,
      parseInt(req.query.tankId as string),
      true,
    );
  },
};
