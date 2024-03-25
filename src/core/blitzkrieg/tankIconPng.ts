import { webpToPng } from './iconPng';
import { tankIcon } from './tankIcon';

export function tankIconPng(id: number) {
  return webpToPng(tankIcon(id));
}
