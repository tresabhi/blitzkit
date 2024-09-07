import { assertSecret } from '@blitzkit/core';
import { Region } from '../../constants/regions';
import { EventManager } from '../blitzkit/eventManager';
import { patientFetch } from '../blitzkit/patientFetch';

const RETRY_ERRORS = ['REQUEST_LIMIT_EXCEEDED', 'SOURCE_NOT_AVAILABLE'];

export const retryAbleBlitzFetchEvent = new EventManager();
export const blitzFetchQueueAvailableEvent = new EventManager();

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

function decrement() {
  inProgress--;
  blitzFetchQueueAvailableEvent.emit(undefined);
  manageQueue();
}

async function manageQueue() {
  if (queue.length > 0 && inProgress < MAX_CALLS_PER_SECOND) {
    inProgress++;

    const timeout = setTimeout(decrement, 1000);
    const request = queue.shift()!;
    const data = (await patientFetch(request.url)
      .then((response) => response.json())
      .catch((error) => ({ status: 'error', error }))) as BlitzResponse<
      typeof request.resolve
    >;

    if (data.status === 'ok') {
      request.resolve(data.data);
    } else {
      if (RETRY_ERRORS.includes(data.error.message)) {
        retryAbleBlitzFetchEvent.emit(undefined);
        clearTimeout(timeout);
        setTimeout(() => {
          queue.push(request);
          decrement();
        }, 1000 / MAX_CALLS_PER_SECOND);
      } else {
        clearTimeout(timeout);
        decrement();

        throw new Error(`Wargaming response error status: "${data.status}"`, {
          cause: `Message: "${data.error.message}"\nURL: "${request.url}"`,
        });
      }
    }
  }
}

export type FetchBlitzParams = Record<string, string | number | undefined>;

export default function fetchBlitz<Data extends object>(
  region: Region,
  path: string,
  params: FetchBlitzParams = {},
) {
  return new Promise<Data>((resolve) => {
    queue.push({
      url: `https://api.wotblitz.${region}/wotb/${path}/?${Object.entries({
        application_id: assertSecret(process.env.WARGAMING_APPLICATION_ID),
        ...params,
      })
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${encodeURIComponent(value!)}`)
        .join('&')}`,
      resolve(data) {
        resolve(data as Data);
      },
    });
    manageQueue();
  });
}
