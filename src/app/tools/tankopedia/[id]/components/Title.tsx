import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Flex, Heading, Link, Text } from '@radix-ui/themes';
import { Flag } from '../../../../../components/Flag';
import { useDuel } from '../../../../../stores/duel';

export function Title() {
  const protagonist = useDuel((state) => state.protagonist!);

  return (
    <Flex justify="between" align="center">
      <Link
        href="/tools/tankopedia"
        style={{ color: 'unset', textDecoration: 'none' }}
      >
        <Flex gap="1" align="center">
          <ArrowLeftIcon />
          <Text>Back</Text>
        </Flex>
      </Link>

      <Flex gap="2" align="center">
        <Flag nation={protagonist.tank.nation} />
        <Heading>{protagonist.tank.name}</Heading>
      </Flex>
    </Flex>
  );
}
