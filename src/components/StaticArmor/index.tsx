import { useThree } from '@react-three/fiber';
import { TankDefinitions } from '../../core/blitzkit/tankDefinitions';
import { StaticArmorScene } from './components/StaticArmorScene';

export function StaticArmor({
  awaitedTankDefinitions,
}: {
  awaitedTankDefinitions: TankDefinitions;
}) {
  const scene = useThree((state) => state.scene);

  return (
    <StaticArmorScene
      awaitedTankDefinitions={awaitedTankDefinitions}
      scene={scene}
    />
  );
}
