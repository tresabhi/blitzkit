import { PageWrapper } from 'packages/website-ue/src/components/PageWrapper';
import { ffi } from 'packages/website-ue/src/core/blitzkit/ffi';

export function Page() {
  return (
    <PageWrapper align="center" justify="center">
      🟢 {ffi.echo(new Date().toLocaleString())}
      <img src="https://i.imgflip.com/9wrr7u.gif" />
    </PageWrapper>
  );
}
