import { useEffect, useRef } from 'react';

export function useDelta(value: number) {
  const lastValue = useRef(value);

  useEffect(() => {
    lastValue.current = value;
  });

  return value - lastValue.current;
}
