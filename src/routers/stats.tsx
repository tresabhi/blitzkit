import resolvePeriodFromRequest from '../core/express/resolvePeriodFromRequest.js';
import resolvePlayerFromRequest from '../core/express/resolvePlayerFromRequest.js';
import statsfull, { StatType } from '../renderers/statsfull.js';
import { RouterRegistry } from '../server.js';

export default {
  route: '/stats/:type/:period',
  inProduction: true,
  inDevelopment: true,

  async handler(req) {
    const type = req.params.type as StatType;
    const period = resolvePeriodFromRequest(req);
    const player = resolvePlayerFromRequest(req);

    return await statsfull(
      type,
      period,
      player,
      parseInt(req.query.tank as string),
    );
  },
} satisfies RouterRegistry;
