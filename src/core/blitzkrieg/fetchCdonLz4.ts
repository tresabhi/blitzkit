import { superDecompress } from './superDecompress';

export async function fetchCdonLz4<Type>(url: string) {
  return await fetch(url, { cache: 'no-cache' })
    .then((response) => response.arrayBuffer())
    .then((buffer) => superDecompress<Type>(new Uint8Array(buffer)));
}
