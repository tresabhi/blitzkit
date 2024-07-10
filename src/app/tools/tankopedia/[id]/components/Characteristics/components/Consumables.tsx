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
import { ConsumablesManager } from '../../../../../../../components/ConsumablesManager';
import { checkConsumableProvisionInclusivity } from '../../../../../../../core/blitzkit/checkConsumableProvisionInclusivity';
import { consumableDefinitions } from '../../../../../../../core/blitzkit/consumableDefinitions';
import { useEquipment } from '../../../../../../../hooks/useEquipment';
import * as Duel from '../../../../../../../stores/duel';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Consumables() {
  const mutateDuel = Duel.useMutation();
  const protagonist = Duel.use((state) => state.protagonist!);
  const awaitedConsumableDefinitions = use(consumableDefinitions);
  const consumables = Duel.use((state) => state.protagonist!.consumables);
  const consumablesList = Object.values(awaitedConsumableDefinitions).filter(
    (consumable) =>
      checkConsumableProvisionInclusivity(
        consumable,
        protagonist.tank,
        protagonist.gun,
      ),
  );
  const cooldownBooster = Duel.use(
    (state) => state.protagonist!.cooldownBooster,
  );
  const hasConsumableDeliverySystem = useEquipment(118);
  const hasHighEndConsumables = useEquipment(101);

  return (
    <ConfigurationChildWrapper>
      <Flex gap="4" align="center">
        <Flex gap="2" align="center">
          <Heading size="4">Consumables</Heading>

          <Popover.Root>
            <Popover.Trigger>
              <IconButton variant="ghost">
                <InfoCircledIcon />
              </IconButton>
            </Popover.Trigger>

            <Popover.Content>
              <Text>
                <Text color="amber">Yellow consumables</Text> do not affect the
                statistics.
              </Text>
            </Popover.Content>
          </Popover.Root>
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

      <ConsumablesManager
        consumables={consumablesList}
        selected={consumables}
        cooldownBooster={cooldownBooster}
        disabled={protagonist.tank.consumables === consumables.length}
        hasConsumableDeliverySystem={hasConsumableDeliverySystem}
        hasHighEndConsumables={hasHighEndConsumables}
        timers
        onChange={(consumables) => {
          mutateDuel((draft) => {
            draft.protagonist!.consumables = consumables;
          });
        }}
      />
    </ConfigurationChildWrapper>
  );
}
