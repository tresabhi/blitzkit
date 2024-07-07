import { Skeleton, Table } from '@radix-ui/themes';
import { times } from 'lodash';
import { useEffect, useRef } from 'react';
import { tankPerformanceSortTypeNamesArray } from '../../../../stores/tankPerformanceSort';

interface RowLoaderProps {
  onIntersection?: () => void;
}

export function RowLoader({ onIntersection }: RowLoaderProps) {
  const row = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (!onIntersection || !row.current) return;

    const observer = new IntersectionObserver(onIntersection);
    observer.observe(row.current);

    return () => observer.disconnect();
  }, []);

  return (
    <Table.Row ref={row}>
      <Table.RowHeaderCell align="center">
        <Skeleton height="100%" width="128px" />
      </Table.RowHeaderCell>

      {times(tankPerformanceSortTypeNamesArray.length, (index) => (
        <Table.Cell key={index} align="center">
          <Skeleton height="1em" width="32px" />
        </Table.Cell>
      ))}
    </Table.Row>
  );
}
