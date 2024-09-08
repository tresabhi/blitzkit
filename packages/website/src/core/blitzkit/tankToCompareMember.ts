import { TankDefinition } from '@blitzkit/core';
import { ProvisionDefinitions } from '@blitzkit/core/src/blitzkit/provisionDefinitions';
import { uniqueId } from 'lodash';
import { CompareMember } from '../../stores/compareEphemeral';
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
