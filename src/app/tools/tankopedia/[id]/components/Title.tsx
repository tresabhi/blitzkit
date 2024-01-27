import { Flex, Heading } from '@radix-ui/themes';
import { Flag } from '../../../../../components/Flag';
import { useDuel } from '../../../../../stores/duel';

export function Title() {
  const protagonist = useDuel((state) => state.protagonist!);

  return (
    <Flex justify="between" align="center">
      <Flex gap="2" align="center">
        <Flag nation={protagonist.tank.nation} />
        <Heading>{protagonist.tank.name}</Heading>
      </Flex>
    </Flex>
  );
}
