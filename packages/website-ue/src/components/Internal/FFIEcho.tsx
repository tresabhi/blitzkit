import { Flex, Text } from '@radix-ui/themes';
import { ffi } from '../../core/blitzkit/ffi';

export function FFIEcho() {
  return (
    <Flex direction="column" align="start" gap="2">
      <Text>{ffi.debug_echo(new Date().toLocaleString())}</Text>
      <img src="https://i.imgflip.com/9wrr7u.gif" />
    </Flex>
  );
}
