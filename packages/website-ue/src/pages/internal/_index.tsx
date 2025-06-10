import { Heading } from '@radix-ui/themes';
import { FFIEcho } from '../../components/Internal/FFIEcho';
import { FFIFileCount } from '../../components/Internal/FFIFileCount';
import { PageWrapper } from '../../components/PageWrapper';

export function Page() {
  return (
    <PageWrapper color="amber">
      <Heading>BlitzKit FFI</Heading>
      <FFIEcho />
      <FFIFileCount />
    </PageWrapper>
  );
}
