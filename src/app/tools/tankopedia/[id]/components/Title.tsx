import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Flex, Heading, Link, Text } from '@radix-ui/themes';
import { Flag } from '../../../../../components/Flag';
import { Duel } from '../page';

interface TitleProps {
  duel: Duel;
}

export function Title({ duel }: TitleProps) {
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
        <Flag nation={duel.protagonist.tank.nation} />
        <Heading>{duel.protagonist.tank.name}</Heading>
      </Flex>
    </Flex>
  );
}
