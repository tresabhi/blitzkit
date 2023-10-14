import { tankopedia } from '../blitzstars/tankopedia';

export default async function resolveTankName(tankId: number) {
  const tankopediaName = (await tankopedia)[tankId]?.name;
  return tankopediaName ? tankopediaName : `Unknown Tank ${tankId}`;
}
