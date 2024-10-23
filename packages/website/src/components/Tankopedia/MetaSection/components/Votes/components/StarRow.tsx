import { Flex, Text } from '@radix-ui/themes';
import { Stars } from '../../Stars';

interface StarRowProps {
  stars: number | null;
  children: string;
}

export function StarRow({ stars, children }: StarRowProps) {
  return (
    <Text color={stars === null ? 'gray' : undefined}>
      <Flex align="center" justify="between" width="15rem">
        {children}
        <Stars stars={stars} />
      </Flex>
    </Text>
  );
}
