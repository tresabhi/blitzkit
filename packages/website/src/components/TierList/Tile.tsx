import type { TankDefinition } from '@blitzkit/core';
import {
  useCallback,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { TierList } from '../../stores/tierList';
import { TankCard } from '../TankCard';
import { tierListDropOffs } from './DropOff/constants';

interface TierListTileProps {
  tank: TankDefinition;
}

export function TierListTile({ tank }: TierListTileProps) {
  const card = useRef<HTMLDivElement>(null);
  const mutateTierList = TierList.useMutation();
  const lastPosition = useRef({ x: 0, y: 0 });
  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLSpanElement>) => {
      if (!card.current) return;

      event.preventDefault();

      const rect = card.current.getBoundingClientRect();

      card.current.style.position = 'fixed';
      card.current.style.cursor = 'grabbing';
      card.current.style.zIndex = '1';
      card.current.style.left = `${rect.left}px`;
      card.current.style.top = `${rect.top}px`;

      lastPosition.current = { x: event.clientX, y: event.clientY };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);

      mutateTierList((draft) => {
        draft.dragging = true;
      });
    },
    [],
  );
  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!card.current) return;

    event.preventDefault();

    const rect = card.current.getBoundingClientRect();
    const dx = event.clientX - lastPosition.current.x;
    const dy = event.clientY - lastPosition.current.y;

    card.current.style.left = `${rect.left + dx}px`;
    card.current.style.top = `${rect.top + dy}px`;

    lastPosition.current = { x: event.clientX, y: event.clientY };
  }, []);
  const handlePointerUp = useCallback((event: PointerEvent) => {
    if (!card.current) return;

    const rect = card.current.getBoundingClientRect();
    let dropOff: { row: number; index: number; distance: number };

    tierListDropOffs.forEach((element) => {
      const thisRect = element.getBoundingClientRect();
      const thisX = (thisRect.left + thisRect.right) / 2;
      const thisY = (thisRect.top + thisRect.bottom) / 2;
      let distance = 0;

      if (
        (thisX < rect.left || thisX > rect.right) &&
        (thisY < rect.top || thisY > rect.bottom)
      ) {
        const rectX = (rect.left + rect.right) / 2;
        const rectY = (rect.top + rect.bottom) / 2;
        distance = Math.sqrt((thisX - rectX) ** 2 + (thisY - rectY) ** 2);
      }

      if (dropOff === undefined || dropOff.distance > distance) {
        dropOff = {
          row: Number(element.dataset.row),
          index: Number(element.dataset.index),
          distance,
        };
      }
    });

    mutateTierList((draft) => {
      draft.dragging = false;
      draft.tanks = draft.tanks.map((tanks) =>
        tanks.filter((id) => id !== tank.id),
      );

      if (dropOff) {
        draft.tanks[dropOff.row].splice(dropOff.index, 0, tank.id);
      }
    });

    card.current.style.position = 'static';
    card.current.style.zIndex = 'unset';
    card.current.style.cursor = 'grab';

    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
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
