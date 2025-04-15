import type {
  ModelDefinition,
  ProvisionDefinitions,
  TankDefinition,
} from '@blitzkit/core';
import { uniqueId } from 'lodash-es';
import type { CompareMember } from '../../stores/compareEphemeral';
import { tankToDuelMember } from './tankToDuelMember';

export function tankToCompareMember(
  tank: TankDefinition,
  model: ModelDefinition,
  provisionDefinitions: ProvisionDefinitions,
) {
  return {
    ...tankToDuelMember(tank, model, provisionDefinitions),
    key: uniqueId(),
  } satisfies CompareMember;
}
