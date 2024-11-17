import type { TankDefinition } from '@blitzkit/core';
import {
  useCallback,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { TankCard } from '../TankCard';

interface TierListTileProps {
  tank: TankDefinition;
}

export function TierListTile({ tank }: TierListTileProps) {
  const card = useRef<HTMLDivElement>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLSpanElement>) => {
      if (!card.current) return;

      const rect = card.current.getBoundingClientRect();

      card.current.style.position = 'fixed';
      card.current.style.cursor = 'grabbing';
      card.current.style.zIndex = '1';
      card.current.style.left = `${rect.left}px`;
      card.current.style.top = `${rect.top}px`;

      lastPosition.current = { x: event.clientX, y: event.clientY };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [],
  );
  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!card.current) return;

    const rect = card.current.getBoundingClientRect();
    const dx = event.clientX - lastPosition.current.x;
    const dy = event.clientY - lastPosition.current.y;

    card.current.style.left = `${rect.left + dx}px`;
    card.current.style.top = `${rect.top + dy}px`;

    lastPosition.current = { x: event.clientX, y: event.clientY };
  }, []);
  const handlePointerUp = useCallback(() => {
    if (!card.current) return;

    card.current.style.position = 'static';
    card.current.style.zIndex = 'unset';
    card.current.style.cursor = 'grab';
  }, []);

  return (
    <TankCard
      ref={card}
      noLink
      tank={tank}
      style={{ cursor: 'grab' }}
      onPointerDown={handlePointerDown}
    />
  );
}
