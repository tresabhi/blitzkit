import { parentPort, threadId } from 'worker_threads';
import svgToPng from '../core/blitzkit/svgToPng';

console.log(`🟢 Launched render worker ${threadId}`);

parentPort?.on('message', async (svg: string) => {
  const png = svgToPng(svg);
  parentPort?.postMessage(png);
});
