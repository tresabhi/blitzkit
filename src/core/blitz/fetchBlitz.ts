import { patientFetch } from '../blitzkrieg/patientFetch';

type BlitzResponse<Data extends object> =
  | {
      status: 'error';
      error: { field: string; message: string; code: 402; value: null };
    }
  | {
      status: 'ok';
      data: Data;
    };

const MAX_CALLS_PER_SECOND = 10;

const queue: { url: string; resolve: (data: object) => void }[] = [];
let inProgress = 0;

async function manageQueue() {
  if (queue.length > 0 && inProgress < MAX_CALLS_PER_SECOND) {
    inProgress++;

    const timeout = setTimeout(() => {
      inProgress--;
      manageQueue();
    }, 1000);

    const request = queue.shift()!;
    const data = (await patientFetch(request.url)
      .then((response) => response.json())
      .catch((error) => ({ status: 'error', error }))) as BlitzResponse<
      typeof request.resolve
    >;

    if (data.status === 'ok') {
      request.resolve(data.data);
    } else {
      if (data.error.message === 'REQUEST_LIMIT_EXCEEDED') {
        console.log(
          `Rate limit exceeded, putting "${request.url}" back in queue...`,
        );

        clearTimeout(timeout);
        setTimeout(() => {
          queue.push(request);
          inProgress--;
          manageQueue();
        }, 1000 / MAX_CALLS_PER_SECOND);
      } else {
        clearTimeout(timeout);
        inProgress--;
        manageQueue();

        throw new Error(`Wargaming response error status: "${data.status}"`, {
          cause: `Message: "${data.error.message}"\nURL: "${request.url}"`,
        });
      }
    }
  }
}

export default function fetchBlitz<Data extends object>(url: string) {
  return new Promise<Data>((resolve) => {
    queue.push({
      url,
      resolve(data) {
        resolve(data as Data);
      },
    });
    manageQueue();
  });
}
