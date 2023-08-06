import resolvePeriodFromRequest from '../core/express/resolvePeriodFromRequest';
import resolvePlayerFromRequest from '../core/express/resolvePlayerFromRequest';
import stats, { StatType } from '../renderers/stats';
import { RouteRegistry } from '../server';

export const statsRoute: RouteRegistry = {
  route: '/stats/:type/:period',
  inProduction: true,
  inDevelopment: false,

  async handler(req) {
    const type = req.params.type as StatType;
    const player = resolvePlayerFromRequest(req);
    const period = resolvePeriodFromRequest(player.region, req);

    return await stats(
      type,
      period,
      player,
      parseInt(req.query.tankId as string),
      true,
    );
  },
};
