import { superDecompress } from './superDecompress';

export async function fetchBkonLz4<Type>(url: string) {
  return await fetch(url, {
    cache: 'no-cache',
  }).then(async (response) => {
    return superDecompress(Buffer.from(await response.arrayBuffer())) as Type;
  });
}
