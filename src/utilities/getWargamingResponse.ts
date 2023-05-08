import fetch from 'node-fetch';
import { WargamingResponse } from '../types/wargamingResponse.js';

export default async function getWargamingResponse<Data extends object>(
  url: string,
) {
  let parsed: WargamingResponse<Data>;

  const response = await fetch(url);
  parsed = (await response.json()) as WargamingResponse<Data>;

  if (parsed.status === 'ok') {
    return parsed.data;
  } else {
    throw new Error(`Wargaming response status ${parsed.status}`);
  }
}
