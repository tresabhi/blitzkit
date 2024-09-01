import { Flex, Text, TextProps } from '@radix-ui/themes';
import { times } from 'lodash';
import { PartialStar } from './components/PartialStar';

export type StarsInt = 1 | 2 | 3 | 4 | 5;

interface StarsProps {
  stars: number | null;
}

export function Stars({ stars }: StarsProps) {
  let color: TextProps['color'] = 'green';

  if (stars === null) color = 'gray';
  else if (stars < 1.5) color = 'tomato';
  else if (stars < 2.5) color = 'orange';
  else if (stars < 3.5) color = 'amber';
  else if (stars < 4.5) color = 'blue';

  return (
    <Text color={color}>
      <Flex>
        {stars !== null &&
          times(Math.floor(stars), (index) => (
            <PartialStar fill={1} key={index} />
          ))}
        {stars !== null && stars % 1 !== 0 && <PartialStar fill={stars % 1} />}
        {times(5 - Math.ceil(stars ?? 0), (index) => (
          <PartialStar fill={0} key={index} />
        ))}
      </Flex>
    </Text>
  );
}
