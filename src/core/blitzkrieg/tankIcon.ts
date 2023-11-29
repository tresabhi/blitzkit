import { asset } from './asset';

export function tankIcon(id: number, size: 'big' | 'small' = 'big') {
  return asset(`icons/${size}/${id}.webp`);
}
