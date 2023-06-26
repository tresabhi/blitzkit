import express from 'express';
import jsxToSvg from './core/ui/jsxToSvg.js';
import today from './renderers/today.js';

const app = express();

app.get('/', async (req, res) => {
  const jsx = await today({ server: 'com', id: 1028700193 });
  const svg = await jsxToSvg(jsx);

  res.writeHead(200, {
    'Content-Type': 'image/svg+xml',
    'Content-Length': svg.length,
  });
  res.end(svg);
});

app.listen(process.env.PORT || 3000);
