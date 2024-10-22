import { Flex } from '@radix-ui/themes';
import { BattleDistributionAcrossTiers } from './components/BattleDistributionAcrossTiers';
import { BattleDistributionAcrossTiersByClass } from './components/BattleDistributionAcrossTiersByClass';

export function Charts() {
  return (
    <Flex justify="center">
      <Flex direction="column" maxWidth="35rem" flexGrow="1" py="6" gap="9">
        <BattleDistributionAcrossTiers />
        <BattleDistributionAcrossTiersByClass />
      </Flex>
    </Flex>
  );
}
