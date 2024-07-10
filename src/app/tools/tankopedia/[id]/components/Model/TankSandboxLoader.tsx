import { Flex, Progress } from '@radix-ui/themes';
import { useProgress } from '@react-three/drei';
import { tankIcon } from '../../../../../../core/blitzkit/tankIcon';

export function TankSandboxLoader({ id }: { id: number }) {
  const data = useProgress();

  return (
    <Flex width="100%" height="100%" align="center" justify="center">
      <img
        src={tankIcon(id)}
        style={{ height: '60%', filter: 'blur(4px) grayscale(1)' }}
      />
      <Progress
        size="3"
        value={data.progress}
        style={{ position: 'absolute', width: 128 }}
      />
    </Flex>
  );
}
