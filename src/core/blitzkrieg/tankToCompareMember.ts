import { CompareMember } from '../../stores/compare';
import { TankDefinition } from './tankDefinitions';
import { tankToDuelMember } from './tankToDuelMember';

export function tankToCompareMember(tank: TankDefinition) {
  const member = {
    ...tankToDuelMember(tank),
    crewSkills: {},
  } satisfies CompareMember;

  return member;
}
