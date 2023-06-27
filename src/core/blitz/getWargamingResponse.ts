import { WargamingResponse } from '../../types/wargamingResponse.js';
import errorWithCause from '../node/errorWithCause.js';

export default async function getWargamingResponse<Data extends object>(
  url: string,
) {
  let parsed: WargamingResponse<Data>;

  const response = await fetch(url);
  parsed = (await response.json()) as WargamingResponse<Data>;

  if (parsed.status === 'ok') {
    return parsed.data;
  } else {
    throw errorWithCause(
      `Wargaming response error status:"${parsed.status}"`,
      `Message: "${parsed.error.message}"\nURL: "${url}"`,
    );
  }
}
