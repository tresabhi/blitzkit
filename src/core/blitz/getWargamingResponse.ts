import throwError from '../node/throwError';

export type WargamingResponse<Data extends object> =
  | {
      status: 'error';
      error: { field: string; message: string; code: 402; value: null };
    }
  | {
      status: 'ok';
      data: Data;
    };

export default async function getWargamingResponse<Data extends object>(
  url: string,
) {
  let parsed: WargamingResponse<Data>;

  const response = await fetch(url);
  parsed = (await response.json()) as WargamingResponse<Data>;

  if (parsed.status === 'ok') {
    return parsed.data;
  } else {
    throw throwError(
      `Wargaming response error status:"${parsed.status}"`,
      `Message: "${parsed.error.message}"\nURL: "${url}"`,
    );
  }
}
