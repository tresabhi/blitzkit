import type { StarsInt } from '@blitzkit/core';
import { type TextProps, Flex, Text } from '@radix-ui/themes';
import { times } from 'lodash-es';
import { PartialStar } from './components/PartialStar';

type StarsProps = TextProps & {
  stars: number | null;
  onCast?: (value: StarsInt) => void;
};

export function Stars({ stars, onCast, ...props }: StarsProps) {
  let color: TextProps['color'] = 'green';

  if (stars === null) color = 'gray';
  else if (stars < 1.5) color = 'tomato';
  else if (stars < 2.5) color = 'orange';
  else if (stars < 3.5) color = 'amber';
  else if (stars < 4.5) color = 'blue';

  return (
    <Text color={color} {...props}>
      <Flex style={{ cursor: onCast ? 'pointer' : 'unset' }}>
        {stars !== null &&
          times(Math.floor(stars), (index) => (
            <PartialStar
              fill={1}
              key={index}
              onClick={() => onCast?.((index + 1) as StarsInt)}
            />
          ))}
        {stars !== null && stars % 1 !== 0 && <PartialStar fill={stars % 1} />}
        {times(5 - Math.ceil(stars ?? 0), (index) => (
          <PartialStar
            fill={0}
            key={index}
            onClick={() =>
              onCast?.((Math.floor(stars ?? 0) + index + 1) as StarsInt)
            }
          />
        ))}
      </Flex>
    </Text>
  );
}
