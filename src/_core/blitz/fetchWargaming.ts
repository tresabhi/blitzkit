import throwError from '../../core/node/throwError';

export type BlitzResponse<Data extends object> =
  | {
      status: 'error';
      error: { field: string; message: string; code: 402; value: null };
    }
  | {
      status: 'ok';
      data: Data;
    };

export default async function fetchBlitz<Data extends object>(url: string) {
  const data = (await fetch(url).then((response) =>
    response.json(),
  )) as BlitzResponse<Data>;

  if (data.status === 'ok') {
    return data.data;
  } else {
    throw throwError(
      `Wargaming response error status:"${data.status}"`,
      `Message: "${data.error.message}"\nURL: "${url}"`,
    );
  }
}
