import { Box } from '@radix-ui/themes';
import { useEffect, useRef } from 'react';
import { TierList } from '../../../stores/tierList';
import { tierListDropOffs } from './constants';
import './index.css';

interface DropOffProps {
  row: number;
  index: number;
}

export function DropOff({ row, index }: DropOffProps) {
  const tierListStore = TierList.useStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = tierListStore.subscribe(
      (state) => state.dragging,
      (dragging) => {
        if (!ref.current) return;
        ref.current.dataset.dragging = `${dragging}`;
      },
    );

    tierListDropOffs.add(ref.current!);

    return () => {
      unsubscribe();
      tierListDropOffs.delete(ref.current!);
    };
  }, []);

  return (
    <Box
      className="drop-off"
      data-dragging="false"
      data-row={row}
      data-index={index}
      ref={ref}
    />
  );
}
