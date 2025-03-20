import { Tank, TankArmor } from '@blitzkit/core';
import { Box } from '@radix-ui/themes';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { ArmorGroup } from '../../../../components/ArmorGroup';
import { PageWrapper } from '../../../../components/PageWrapper';

interface PageProps {
  tank: Tank;
  armor: TankArmor;
}

export function Page({ tank, armor }: PageProps) {
  return (
    <PageWrapper p="0" maxWidth="unset">
      <Box height="100%" width="100%" flexGrow="1" position="relative">
        <Box position="absolute" top="0" left="0" width="100%" height="100%">
          <Canvas>
            <OrbitControls />
            <ArmorGroup group="hull" tank={tank} armor={armor} />
          </Canvas>
        </Box>
      </Box>
    </PageWrapper>
  );
}
