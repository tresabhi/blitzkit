import type { TankDefinition } from '@blitzkit/core';
import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { TierList } from '../../stores/tierList';
import { TankCard } from '../TankCard';
import { tierListCardElements, tierListRowElements } from './Table/constants';

type TierListTileProps = {
  tank: TankDefinition;
} & (
  | {
      isPlaced?: false;
    }
  | {
      isPlaced: true;
      rowIndex: number;
      tileIndex: number;
    }
);

export function TierListTile(props: TierListTileProps) {
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

    const cardRect = card.current.getBoundingClientRect();
    const cardX = (cardRect.left + cardRect.right) / 2;
    const cardY = (cardRect.top + cardRect.bottom) / 2;
    let wasPlaced = false;

    rowLoop: for (const row of tierListRowElements) {
      const rowRect = row.getBoundingClientRect();
      const isWithinRow =
        cardX >= rowRect.left &&
        cardX <= rowRect.right &&
        cardY >= rowRect.top &&
        cardY <= rowRect.bottom;

      if (!isWithinRow) continue;

      const rowIndex = Number(row.dataset.index);

      for (const tile of tierListCardElements[rowIndex]) {
        const tileId = Number(tile.dataset.tileId);

        if (tileId === props.tank.id) continue;

        const tileRect = tile.getBoundingClientRect();
        const isWithinTile =
          cardX >= tileRect.left &&
          cardX <= tileRect.right &&
          cardY >= tileRect.top &&
          cardY <= tileRect.bottom;

        if (!isWithinTile) continue;

        const tileIndex = Number(tile.dataset.tileIndex);

        mutateTierList((draft) => {
          draft.dragging = false;
          draft.tanks = draft.tanks.map((row) =>
            row.filter((tankId) => tankId !== props.tank.id),
          );
          draft.tanks[rowIndex].splice(tileIndex, 0, props.tank.id);
        });

        wasPlaced = true;

        break rowLoop;
      }

      mutateTierList((draft) => {
        draft.dragging = false;
        draft.tanks = draft.tanks.map((row) =>
          row.filter((tankId) => tankId !== props.tank.id),
        );
        draft.tanks[rowIndex].push(props.tank.id);
      });

      wasPlaced = true;

      break;
    }

    if (!wasPlaced) {
      mutateTierList((draft) => {
        draft.dragging = false;
        draft.tanks = draft.tanks.map((row) =>
          row.filter((tankId) => tankId !== props.tank.id),
        );
      });
    }

    card.current.style.position = 'static';
    card.current.style.zIndex = 'unset';
    card.current.style.cursor = 'grab';

    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, []);

  useEffect(() => {
    if (!props.isPlaced || !card.current) return;

    tierListCardElements[props.rowIndex].add(card.current);

    return () => {
      if (!card.current) return;

      tierListCardElements[props.rowIndex].delete(card.current);
    };
  }, []);

  return (
    <TankCard
      data-tile-index={props.isPlaced ? props.tileIndex : undefined}
      data-tile-id={props.tank.id}
      ref={card}
      noLink
      tank={props.tank}
      style={{ cursor: 'grab' }}
      onPointerDown={handlePointerDown}
    />
  );
}
