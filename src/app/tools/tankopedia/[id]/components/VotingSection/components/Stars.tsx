import { StarFilledIcon, StarIcon } from '@radix-ui/react-icons';
import { Flex, Text, TextProps } from '@radix-ui/themes';
import { times } from 'lodash';

interface StarsProps {
  stars: 1 | 2 | 3 | 4 | 5;
  lowerIsBetter?: boolean;
}

export function Stars({ stars, lowerIsBetter = false }: StarsProps) {
  let color: TextProps['color'];
  const trueStars = lowerIsBetter ? 6 - stars : stars;

  switch (trueStars) {
    case 1:
      color = 'red';
      break;
    case 2:
      color = 'orange';
      break;
    case 3:
      color = 'amber';
      break;
    case 4:
      color = 'blue';
      break;
    case 5:
      color = 'green';
      break;
  }

  return (
    <Flex>
      <Text color={color}>
        {times(stars, () => (
          <StarFilledIcon />
        ))}
      </Text>
      <Text>
        {times(5 - stars, () => (
          <StarIcon />
        ))}
      </Text>
    </Flex>
  );
}
