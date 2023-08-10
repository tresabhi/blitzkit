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
      req.query.cutoff ? parseInt(req.query.cutoff as string) : undefined,
      req.query.maximized ? parseInt(req.query.maximized as string) : undefined,
      req.query['show-total'] ? req.query['show-total'] === 'true' : undefined,
      true,
    );
  },
};
