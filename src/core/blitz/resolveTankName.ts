import { tankopedia } from './tankopedia.js';

export default function resolveTankName(tankId: number) {
  const tankopediaName = tankopedia[tankId].name;
  return tankopediaName ? tankopediaName : `Unknown Tank ${tankId}`;
}
