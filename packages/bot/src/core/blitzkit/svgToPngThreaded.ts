import { Worker } from 'worker_threads';

const RENDER_WORKERS = 1;

const workers = [...Array(RENDER_WORKERS)].map(() => {
  const worker = new Worker('dist/bot/workers/render.js');
  console.log(`🟡 Launching render worker ${worker.threadId}`);
  return worker;
});
const queue: {
  svg: string;
  resolve: (png: Buffer) => void;
}[] = [];

function manageQueue() {
  if (queue.length > 0 && workers.length > 0) {
    const { svg, resolve } = queue.shift()!;
    const worker = workers.shift()!;

    function cleanup() {
      workers.push(worker);
      worker.off('message', handleMessage);
      worker.off('error', handleError);
      manageQueue();
    }
    function handleMessage(png: Uint8Array) {
      cleanup();
      resolve(Buffer.from(png));
    }
    function handleError(error: Error) {
      cleanup();
      throw error;
    }

    worker.postMessage(svg);
    worker.on('message', handleMessage);
    worker.on('error', handleError);
  }
}

export function svgToPngThreaded(svg: string) {
  return new Promise<Buffer>((resolve) => {
    queue.push({ svg, resolve });
    manageQueue();
  });
}
