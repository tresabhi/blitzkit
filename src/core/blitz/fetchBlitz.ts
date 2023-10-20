export type BlitzResponse<Data extends object> =
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

    setTimeout(() => {
      inProgress--;
      manageQueue();
    }, 1000);

    const { url, resolve } = queue.shift()!;
    const data = (await fetch(url)
      .then((response) => response.json())
      .catch((error) => ({ status: 'error', error }))) as BlitzResponse<
      typeof resolve
    >;

    manageQueue();

    if (data.status === 'ok') {
      resolve(data.data);
    } else {
      throw new Error(`Wargaming response error status:"${data.status}"`, {
        cause: `Message: "${data.error.message}"\nURL: "${url}"`,
      });
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
