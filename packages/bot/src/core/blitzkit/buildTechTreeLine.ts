import { fetchTankDefinitions } from '@blitzkit/core';
import { resolveAncestry } from './resolveAncestry';

export async function buildTechTreeLine(start: number, end: number) {
  const tankDefinitions = await fetchTankDefinitions();
  const endTank = tankDefinitions.tanks[end];
  if (!endTank.ancestors) throw new Error('End tank has no ancestors');
  const line = [end];

  if (start === end) return line;
  for (const ancestorId of endTank.ancestors) {
    if ((await resolveAncestry(ancestorId)).includes(start)) {
      const ancestorTree = await buildTechTreeLine(start, ancestorId);
      line.push(...ancestorTree);
      break;
    }
  }

  return line;
}
