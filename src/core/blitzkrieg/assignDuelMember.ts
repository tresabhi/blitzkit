import { mutateDuel } from '../../stores/duel';
import { provisionDefinitions } from './provisionDefinitions';
import { tankDefinitions } from './tankDefinitions';
import { tankToDuelMember } from './tankToDuelMember';

export async function assignDuelMember(
  type: 'antagonist' | 'protagonist' | 'both',
  id: number,
) {
  const awaitedTankDefinitions = await tankDefinitions;
  const awaitedProvisionDefinitions = await provisionDefinitions;
  const tank = awaitedTankDefinitions[id];
  const member = tankToDuelMember(tank, awaitedProvisionDefinitions);

  mutateDuel((draft) => {
    draft.assigned = true;
    if (type === 'antagonist') {
      draft.antagonist = member;
    } else if (type === 'protagonist') {
      draft.protagonist = member;
    } else {
      draft.protagonist = member;
      draft.antagonist = { ...member };
    }
  });
}
