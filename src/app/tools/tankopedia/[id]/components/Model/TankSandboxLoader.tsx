import { Flex, FlexProps, Progress } from '@radix-ui/themes';
import { useProgress } from '@react-three/drei';
import { tankIcon } from '../../../../../../core/blitzkit/tankIcon';

type TankSandboxLoaderProps = Omit<FlexProps, 'id'> & {
  id: number;
};

export function TankSandboxLoader({ id, ...props }: TankSandboxLoaderProps) {
  const data = useProgress();

  return (
    <Flex width="100%" height="100%" align="center" justify="center" {...props}>
      <img src={tankIcon(id)} style={{ height: '60%', filter: 'blur(4px)' }} />
      <Progress
        size="3"
        value={data.progress}
        style={{ position: 'absolute', width: 128 }}
      />
    </Flex>
  );
}
