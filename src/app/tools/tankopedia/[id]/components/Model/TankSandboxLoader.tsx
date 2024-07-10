import { Flex, Spinner } from '@radix-ui/themes';
import { tankIcon } from '../../../../../../core/blitzkit/tankIcon';

export function TankSandboxLoader({ id }: { id: number }) {
  return (
    <Flex width="100%" height="100%" align="center" justify="center">
      <img src={tankIcon(id)} style={{ height: '75%', filter: 'blur(0rem)' }} />
      <Spinner size="3" style={{ position: 'absolute' }} />
    </Flex>
  );
}
