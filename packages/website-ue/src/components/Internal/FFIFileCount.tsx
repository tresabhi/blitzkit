import { Code, Text } from '@radix-ui/themes';
import { ffi } from '../../core/blitzkit/ffi';

export function FFIFileCount() {
  return (
    <Text>
      <Code>{ffi.debug_get_file_count().toLocaleString()}</Code> files loaded
    </Text>
  );
}
