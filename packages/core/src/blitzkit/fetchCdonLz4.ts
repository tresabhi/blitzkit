import { superDecompress } from '@blitzkit/core/src/blitzkit/superDecompress';

export async function fetchCdonLz4<Type>(url: string) {
  return await fetch(url, { cache: 'no-store' })
    .then((response) => response.arrayBuffer())
    .then((buffer) => superDecompress<Type>(buffer));
}
