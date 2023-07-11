import resolvePlayerFromRequest from '../core/express/resolvePlayerFromRequest.js';
import today from '../renderers/today.js';
import { RouteRegistry } from '../server.js';

export const todayRoute: RouteRegistry = {
  route: '/today',
  inProduction: true,
  inDevelopment: false,

  async handler(req) {
    const player = resolvePlayerFromRequest(req);

    return await today(
      player,
      req.query.limit ? parseInt(req.query.limit as string) : undefined,
      true,
    );
  },
};
