import { fetchConsumableDefinitions } from '@blitzkit/core';
import { checkConsumableProvisionInclusivity } from '@blitzkit/core/src/blitzkit/checkConsumableProvisionInclusivity';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import {
  Button,
  Flex,
  Heading,
  IconButton,
  Popover,
  Text,
} from '@radix-ui/themes';
import { useEquipment } from '../../../../hooks/useEquipment';
import { Duel } from '../../../../stores/duel';
import { ConsumablesManager } from '../../../ConsumablesManager';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

const consumableDefinitions = await fetchConsumableDefinitions();

export function Consumables() {
  const mutateDuel = Duel.useMutation();
  const protagonist = Duel.use((state) => state.protagonist);
  const consumables = Duel.use((state) => state.protagonist.consumables);
  const consumablesList = Object.values(consumableDefinitions).filter(
    (consumable) =>
      checkConsumableProvisionInclusivity(
        consumable,
        protagonist.tank,
        protagonist.gun,
      ),
  );
  const cooldownBooster = Duel.use(
    (state) => state.protagonist.cooldownBooster,
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
              draft.protagonist.consumables = [];
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
        disabled={protagonist.tank.maxConsumables === consumables.length}
        hasConsumableDeliverySystem={hasConsumableDeliverySystem}
        hasHighEndConsumables={hasHighEndConsumables}
        timers
        onConsumablesChange={(consumables) => {
          mutateDuel((draft) => {
            draft.protagonist.consumables = consumables;
          });
        }}
        justify={{ initial: 'center', sm: 'start' }}
      />
    </ConfigurationChildWrapper>
  );
}
