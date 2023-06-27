import express, { Request, Response } from 'express';
import normalizeRouterReturnable from './core/express/normalizeRouterReturnable.js';
import isDev from './core/node/isDev.js';
import { Registry } from './events/interactionCreate/index.js';
import stats from './routers/stats.js';

export type RouterReturnable = JSX.Element | Promise<JSX.Element>;

export interface RouterRegistry<HandlesInteraction extends boolean = false>
  extends Registry {
  route: string;
  handlesInteraction?: HandlesInteraction;

  handler: (
    req: Request,
    res: Response,
  ) => HandlesInteraction extends true ? void : RouterReturnable;
}

const app = express();

([stats] as RouterRegistry[]).forEach((registry) => {
  if (!(isDev() ? registry.inDevelopment : registry.inProduction)) return;

  app.get(registry.route, async (req, res) => {
    const returnable = registry.handler(req, res);

    if (registry.handlesInteraction) return;

    const response = await normalizeRouterReturnable(returnable);

    res.writeHead(200, {
      'Content-Type': 'image/svg+xml',
      'Content-Length': response.length,
    });
    res.end(response);
  });
});

app.listen(process.env.PORT ?? 3000);
