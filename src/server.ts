import express, { Request, Response } from 'express';
import normalizeResponderReturnable from './core/express/normalizeResponderReturnable.js';
import isDev from './core/node/isDev.js';
import { Registry } from './events/interactionCreate/index.js';
import stats from './responders/stats.js';

export type ResponderReturnable = JSX.Element | Promise<JSX.Element>;

export interface ResponderRegistry<HandlesInteraction extends boolean = false>
  extends Registry {
  route: string;
  handlesInteraction?: HandlesInteraction;

  handler: (
    req: Request,
    res: Response,
  ) => HandlesInteraction extends true ? void : ResponderReturnable;
}

const app = express();

([stats] as ResponderRegistry[]).forEach((registry) => {
  if (!(isDev() ? registry.inDevelopment : registry.inProduction)) return;

  app.get(registry.route, async (req, res) => {
    const returnable = registry.handler(req, res);

    if (registry.handlesInteraction) return;

    const response = await normalizeResponderReturnable(returnable);

    res.writeHead(200, {
      'Content-Type': 'image/svg+xml',
      'Content-Length': response.length,
    });
    res.end(response);
  });
});

app.listen(process.env.PORT ?? 3000);
