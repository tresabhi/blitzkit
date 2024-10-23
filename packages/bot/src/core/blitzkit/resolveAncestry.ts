import { fetchTankDefinitions } from '@blitzkit/core';

export async function resolveAncestry(id: number) {
  const tankDefinitions = await fetchTankDefinitions();
  const tank = tankDefinitions.tanks[id];
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
    (a, b) => tankDefinitions.tanks[b].tier - tankDefinitions.tanks[a].tier,
  );
}
