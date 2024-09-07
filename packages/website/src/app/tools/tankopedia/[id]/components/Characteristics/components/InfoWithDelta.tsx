import { useDelta } from '../../../../../../../hooks/useDelta';
import { Info, InfoProps } from './Info';

interface InfoWithDeltaProps extends InfoProps {
  children: number;
}

export function InfoWithDelta({ children, ...props }: InfoWithDeltaProps) {
  const delta = useDelta(children);

  return (
    <Info {...props} delta={delta}>
      {children}
    </Info>
  );
}
