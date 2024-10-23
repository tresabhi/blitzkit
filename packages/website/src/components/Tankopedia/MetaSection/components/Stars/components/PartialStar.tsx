import { StarFilledIcon, StarIcon } from '@radix-ui/react-icons';
import { Box, type BoxProps } from '@radix-ui/themes';

type PartialStarProps = BoxProps & {
  fill: number;
};

export function PartialStar({ fill, ...props }: PartialStarProps) {
  return (
    <Box height="1em" width="1em" position="relative" {...props}>
      <StarIcon width="1em" height="1em" />
      {fill > 0 && (
        <Box
          top="0"
          left="0"
          width={`${fill * 100}%`}
          position="absolute"
          overflow="hidden"
        >
          <StarFilledIcon width="1em" height="1em" />
        </Box>
      )}
    </Box>
  );
}
