import { WargamingResponse } from '../../types/wargamingResponse.js';

export default async function getWargamingResponse<Data extends object>(
  url: string,
) {
  let parsed: WargamingResponse<Data>;

  const response = await fetch(url);
  parsed = (await response.json()) as WargamingResponse<Data>;

  if (parsed.status === 'ok') {
    return parsed.data;
  } else {
    console.error(
      `Wargaming response status ${parsed.status} ${parsed.error.message}`,
    );
    return null;
  }
}
