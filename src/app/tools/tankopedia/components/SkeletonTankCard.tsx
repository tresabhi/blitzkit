import { Flex, Skeleton } from '@radix-ui/themes';

export function SkeletonTankCard() {
  return (
    <Flex direction="column" gap="2">
      <Skeleton height="64px" />
      <Skeleton height="1em" />
    </Flex>
  );
}
