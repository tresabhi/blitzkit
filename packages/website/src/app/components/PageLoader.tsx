import { Flex, Spinner } from '@radix-ui/themes';

export function PageLoader() {
  return (
    <Flex align="center" justify="center" flexGrow="1">
      <Spinner />
    </Flex>
  );
}
