import { asset } from '@blitzkit/core';
import { Box, Flex, type FlexProps, Progress } from '@radix-ui/themes';
import { useProgress } from '@react-three/drei';

type TankSandboxLoaderProps = Omit<FlexProps, 'id'> & {
  id: string;
};

export function TankSandboxLoader({ id, ...props }: TankSandboxLoaderProps) {
  const data = useProgress();

  return (
    <Flex width="100%" height="100%" align="center" justify="center" {...props}>
      <Box
        height="100%"
        width="100%"
        style={{
          filter: 'blur(1rem)',
          backgroundImage: `url(${asset(`tanks/${id}/icons/big.webp`)})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <Progress
        size="3"
        value={data.progress}
        style={{ position: 'absolute', width: '16rem', maxWidth: '50vw' }}
      />
    </Flex>
  );
}
