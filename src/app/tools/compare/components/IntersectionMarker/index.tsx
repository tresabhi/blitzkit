import { useEffect, useRef } from 'react';
import { theme } from '../../../../../stitches.config';
import { insertionMarkers } from './constants';

export function InsertionMarker({ index }: { index: number }) {
  const marker = useRef<HTMLDivElement>(null);

  useEffect(() => {
    insertionMarkers.push({
      element: marker.current!,
      index,
    });

    return () => {
      insertionMarkers.splice(
        insertionMarkers.findIndex(
          (insertionMarker) => insertionMarker.element === marker.current!,
        ),
        1,
      );
    };
  });

  return (
    <div
      ref={marker}
      style={{
        height: '75%',
        width: 2,
        borderRadius: 1,
        backgroundColor: theme.colors.textLowContrast_crimson,
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        opacity: 0,
      }}
    />
  );
}
