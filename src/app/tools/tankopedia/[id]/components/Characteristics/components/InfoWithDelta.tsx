import { useEffect, useRef } from 'react';
import { Info, InfoProps } from './Info';

interface InfoWithDeltaProps extends InfoProps {
  children: number;
}

export function InfoWithDelta({ children, ...props }: InfoWithDeltaProps) {
  const lastValue = useRef(children);

  useEffect(() => {
    lastValue.current = children;
  });

  return (
    <Info {...props} delta={children - lastValue.current}>
      {children}
    </Info>
  );
}
