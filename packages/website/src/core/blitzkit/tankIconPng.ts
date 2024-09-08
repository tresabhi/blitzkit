import { tankIcon } from '@blitzkit/core';
import { iconPng } from './iconPng';

export function tankIconPng(id: number) {
  return iconPng(tankIcon(id));
}
