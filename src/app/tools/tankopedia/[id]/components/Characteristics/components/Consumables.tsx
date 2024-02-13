import { Flex, Heading } from '@radix-ui/themes';
import { use } from 'react';
import { ConsumableButton } from '../../../../../../../components/ModuleButtons/ConsumableButton';
import { checkConsumableProvisionInclusivity } from '../../../../../../../core/blitzkrieg/checkConsumableProvisionInclusivity';
import { consumableDefinitions } from '../../../../../../../core/blitzkrieg/consumableDefinitions';
import { useDuel } from '../../../../../../../stores/duel';
import {
  mutateTankopediaTemporary,
  useTankopediaTemporary,
} from '../../../../../../../stores/tankopedia';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Consumables() {
  const protagonist = useDuel((state) => state.protagonist!);
  const awaitedConsumableDefinitions = use(consumableDefinitions);
  const consumables = useTankopediaTemporary((state) => state.consumables);
  const consumablesList = Object.values(awaitedConsumableDefinitions).filter(
    (consumable) =>
      checkConsumableProvisionInclusivity(
        consumable,
        protagonist.tank,
        protagonist.gun,
      ),
  );

  return (
    <ConfigurationChildWrapper>
      <Heading size="4">Consumables</Heading>

      <Flex wrap="wrap">
        {consumablesList.map((consumable, index) => {
          const selected = consumables.includes(consumable.id);

          return (
            <ConsumableButton
              key={consumable.id}
              first={index === 0}
              last={index === consumablesList.length - 1}
              rowChild
              disabled={
                protagonist.tank.consumables === consumables.length && !selected
              }
              consumable={consumable.id}
              selected={selected}
              onClick={() => {
                mutateTankopediaTemporary((draft) => {
                  if (selected) {
                    draft.consumables = draft.consumables.filter(
                      (id) => id !== consumable.id,
                    );
                  } else {
                    draft.consumables.push(consumable.id);
                  }
                });
              }}
            />
          );
        })}
      </Flex>
    </ConfigurationChildWrapper>
  );
}
