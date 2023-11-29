import { tankopedia } from '../blitzkrieg/tankopedia';

export default async function resolveTankName(tankId: number) {
  const awaitedTankopedia = await tankopedia;
  const entry = awaitedTankopedia[tankId];

  return entry?.name_short ?? entry?.name ?? `Unknown Tank ${tankId}`;
}
