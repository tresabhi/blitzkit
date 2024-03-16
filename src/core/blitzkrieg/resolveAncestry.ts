import { tankDefinitions } from './tankDefinitions';

export async function resolveAncestry(id: number) {
  const awaitedTankDefinitions = await tankDefinitions;
  const tank = awaitedTankDefinitions[id];
  const ancestors: number[] = [];

  if (tank.ancestors) {
    for (const ancestor of tank.ancestors) {
      if (!ancestors.includes(ancestor)) {
        ancestors.push(ancestor);

        for (const ancestorLayer2 of await resolveAncestry(ancestor)) {
          if (!ancestors.includes(ancestorLayer2)) {
            ancestors.push(ancestorLayer2);
          }
        }
      }
    }
  }

  return ancestors.sort(
    (a, b) => awaitedTankDefinitions[b].tier - awaitedTankDefinitions[a].tier,
  );
}
