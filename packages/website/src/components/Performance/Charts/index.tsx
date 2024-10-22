import { Flex } from '@radix-ui/themes';
import { BattleDistributionAcrossTiers } from './components/BattleDistributionAcrossTiersNivo';

export function Charts() {
  return (
    <Flex justify="center">
      <Flex direction="column" maxWidth="45rem" flexGrow="1" py="6" gap="9">
        <BattleDistributionAcrossTiers />
      </Flex>
    </Flex>
  );
}
