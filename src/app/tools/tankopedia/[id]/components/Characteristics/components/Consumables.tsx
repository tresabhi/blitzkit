import { InfoCircledIcon } from '@radix-ui/react-icons';
import {
  Button,
  Flex,
  Heading,
  IconButton,
  Popover,
  Text,
} from '@radix-ui/themes';
import { use } from 'react';
import { ConsumableButton } from '../../../../../../../components/ModuleButtons/ConsumableButton';
import { checkConsumableProvisionInclusivity } from '../../../../../../../core/blitzkrieg/checkConsumableProvisionInclusivity';
import { consumableDefinitions } from '../../../../../../../core/blitzkrieg/consumableDefinitions';
import { useEquipment } from '../../../../../../../hooks/useEquipment';
import { mutateDuel, useDuel } from '../../../../../../../stores/duel';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Consumables() {
  const protagonist = useDuel((state) => state.protagonist!);
  const awaitedConsumableDefinitions = use(consumableDefinitions);
  const consumables = useDuel((state) => state.protagonist!.consumables);
  const consumablesList = Object.values(awaitedConsumableDefinitions).filter(
    (consumable) =>
      checkConsumableProvisionInclusivity(
        consumable,
        protagonist.tank,
        protagonist.gun,
      ),
  );
  const cooldownBooster = useDuel(
    (state) => state.protagonist!.cooldownBooster,
  );
  const hasConsumableDeliverySystem = useEquipment(118);
  const hasHighEndConsumables = useEquipment(101);

  return (
    <ConfigurationChildWrapper>
      <Flex gap="4" align="center">
        <Flex gap="2" align="center">
          <Popover.Root>
            <Popover.Trigger>
              <IconButton variant="ghost">
                <InfoCircledIcon />
              </IconButton>
            </Popover.Trigger>

            <Popover.Content>
              <Flex direction="column" gap="2">
                <Text>
                  <Text color="amber">Yellow consumables</Text> do not affect
                  the statistics.
                </Text>
              </Flex>
            </Popover.Content>
          </Popover.Root>

          <Heading size="4">Consumables</Heading>
        </Flex>

        <Button
          variant="ghost"
          color="red"
          onClick={() => {
            mutateDuel((draft) => {
              draft.protagonist!.consumables = [];
            });
          }}
        >
          Clear
        </Button>
      </Flex>

      <Flex wrap="wrap">
        {consumablesList.map((consumable, index) => {
          const selected = consumables.includes(consumable.id);

          return (
            <ConsumableButton
              special={consumable.duration === undefined}
              duration={
                consumable.duration === undefined
                  ? undefined
                  : consumable.duration * (hasHighEndConsumables ? 0.7 : 1)
              }
              cooldown={
                consumable.cooldown *
                (hasConsumableDeliverySystem ? 0.85 : 1) *
                (1 - cooldownBooster * 0.1)
              }
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
                mutateDuel((draft) => {
                  if (selected) {
                    draft.protagonist!.consumables =
                      draft.protagonist!.consumables.filter(
                        (id) => id !== consumable.id,
                      );
                  } else {
                    draft.protagonist!.consumables.push(consumable.id);
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
