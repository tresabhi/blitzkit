import { Flex, type FlexProps } from '@radix-ui/themes';

export function StatsTableWrapper(props: FlexProps) {
  return (
    <Flex
      direction="column"
      gap="2"
      maxWidth="25rem"
      width={{ initial: '100%', md: '16rem', xl: '20rem' }}
      {...props}
    />
  );
}
