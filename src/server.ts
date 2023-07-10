import express, { Request, Response } from 'express';
import normalizeRouteReturnable from './core/express/normalizeRouteReturnable.js';
import withAutoRefresh from './core/express/withAutoRefresh.js';
import isDev from './core/node/isDev.js';
import { Registry } from './events/interactionCreate/index.js';
import { statsRoute } from './routes/stats.js';
import { todayRoute } from './routes/today.js';

export type RouteReturnable = JSX.Element | Promise<JSX.Element>;

export interface RouteRegistry<HandlesInteraction extends boolean = false>
  extends Registry {
  route: string;
  handlesInteraction?: HandlesInteraction;

  handler: (
    req: Request,
    res: Response,
  ) => HandlesInteraction extends true ? void : RouteReturnable;
}

const app = express();

([statsRoute, todayRoute] as RouteRegistry[]).forEach((registry) => {
  if (!(isDev() ? registry.inDevelopment : registry.inProduction)) return;

  app.get(registry.route, async (req, res) => {
    console.log(req.originalUrl);

    const returnable = registry.handler(req, res);
    if (registry.handlesInteraction) return;

    res.send(
      withAutoRefresh(await normalizeRouteReturnable(returnable), 60 * 1000),
    );
  });
});

app.listen(process.env.PORT ?? 3000);
