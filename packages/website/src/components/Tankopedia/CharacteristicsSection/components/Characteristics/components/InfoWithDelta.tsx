import type { TankCharacteristics } from '../../../../../../core/blitzkit/tankCharacteristics';
import { useDelta } from '../../../../../../hooks/useDelta';
import { type InfoProps, Info } from './Info';

interface InfoWithDeltaProps extends InfoProps {
  stats: TankCharacteristics;
  value: keyof TankCharacteristics | (() => number | undefined);
}

export function InfoWithDelta({ value, stats, ...props }: InfoWithDeltaProps) {
  const uhWhatDoICallThisVariable =
    typeof value === 'function' ? value()! : (stats[value] as number);
  const delta = useDelta(uhWhatDoICallThisVariable);

  return (
    <Info {...props} delta={delta}>
      {uhWhatDoICallThisVariable}
    </Info>
  );
}
