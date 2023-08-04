import resolvePlayerFromRequest from '../core/express/resolvePlayerFromRequest';
import today from '../renderers/today';
import { RouteRegistry } from '../server';

export const todayRoute: RouteRegistry = {
  route: '/today',
  inProduction: true,
  inDevelopment: true,

  async handler(req) {
    const player = resolvePlayerFromRequest(req);

    return await today(
      player,
      req.query.limit ? parseInt(req.query.limit as string) : undefined,
      true,
    );
  },
};
