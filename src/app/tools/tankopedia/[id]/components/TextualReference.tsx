import { Flex, Heading, Text } from '@radix-ui/themes';
import { sumBy } from 'lodash';
import { use, useMemo } from 'react';
import { tankDefinitions } from '../../../../../core/blitzkrieg/tankDefinitions';
import { useDuel } from '../../../../../stores/duel';

export function TextualReference() {
  const awaitedTankDefinitions = use(tankDefinitions);
  const tank = useDuel((state) => state.protagonist!.tank);
  const tierTanks = useMemo(
    () =>
      Object.values(awaitedTankDefinitions).filter(
        ({ tier }) => tank.tier === tier,
      ),
    [tank.id],
  );
  const averageDamage =
    sumBy(
      tierTanks,
      (tank) => tank.turrets.at(-1)!.guns.at(-1)!.shells[0].damage.armor,
    ) / tierTanks.length;

  console.log(averageDamage);

  return (
    <Flex direction="column" gap="2" mt="4">
      <Heading size="6">Textual reference</Heading>

      <Text></Text>
    </Flex>
  );
}
