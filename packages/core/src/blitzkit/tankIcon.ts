import { asset } from '@blitzkit/core/src/blitzkit/asset';

export function tankIcon(id: number, size: 'big' | 'small' = 'big') {
  return asset(`icons/tanks/${size}/${id}.webp`);
}
