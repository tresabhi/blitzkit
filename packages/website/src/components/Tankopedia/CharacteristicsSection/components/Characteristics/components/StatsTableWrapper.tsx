import { Flex, type FlexProps } from '@radix-ui/themes';

export function StatsTableWrapper(props: FlexProps) {
  return (
    <Flex
      direction="column"
      gap="2"
      width={{ initial: '16rem', xs: '20rem', md: '16rem', xl: '20rem' }}
      {...props}
    />
  );
}
