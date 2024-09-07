import { uniqueId } from 'lodash';
import { CompareMember } from '../../../packages/website/src/stores/compareEphemeral';
import { ProvisionDefinitions } from './provisionDefinitions';
import { TankDefinition } from './tankDefinitions';
import { tankToDuelMember } from './tankToDuelMember';

export function tankToCompareMember(
  tank: TankDefinition,
  provisionDefinitions: ProvisionDefinitions,
) {
  return {
    ...tankToDuelMember(tank, provisionDefinitions),
    key: uniqueId(),
  } satisfies CompareMember;
}
