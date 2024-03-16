import { resolveAncestry } from './resolveAncestry';
import { tankDefinitions } from './tankDefinitions';

export async function buildTechTreeLine(start: number, end: number) {
  const awaitedTankDefinitions = await tankDefinitions;
  const endTank = awaitedTankDefinitions[end];
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
