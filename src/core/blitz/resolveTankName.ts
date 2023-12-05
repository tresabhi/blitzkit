import { tankDefinitions } from '../blitzkrieg/definitions/tanks';

export default async function resolveTankName(tankId: number) {
  const awaitedTankDefinitions = await tankDefinitions;
  const entry = awaitedTankDefinitions[tankId];

  return entry?.name_short ?? entry?.name ?? `Unknown Tank ${tankId}`;
}
