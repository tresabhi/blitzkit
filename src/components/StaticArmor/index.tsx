import {
  StaticArmorScene,
  ThicknessRange,
} from './components/StaticArmorScene';

interface StaticArmorProps {
  thicknessRange: ThicknessRange;
}

export function StaticArmor({ thicknessRange }: StaticArmorProps) {
  return <StaticArmorScene thicknessRange={thicknessRange} />;
}
