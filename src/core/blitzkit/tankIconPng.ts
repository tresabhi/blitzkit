import { tankIcon } from '@blitzkit/core/src/blitzkit/tankIcon';
import { iconPng } from './iconPng';

export function tankIconPng(id: number) {
  return iconPng(tankIcon(id));
}
