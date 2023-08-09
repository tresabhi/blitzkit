import express, { Request, Response } from 'express';
import normalizeRouteReturnable from './core/express/normalizeRouteReturnable';
import withAutoRefresh from './core/express/withAutoRefresh';
import isDev from './core/node/isDev';
import { Registry } from './events/interactionCreate';
import { statsRoute } from './routes/stats';
import { todayRoute } from './routes/today';

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
      withAutoRefresh(await normalizeRouteReturnable(returnable), 10 * 1000),
    );
  });
});

app.listen(process.env.PORT ?? 3000);
