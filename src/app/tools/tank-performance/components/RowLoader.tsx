import { Skeleton, Table } from '@radix-ui/themes';
import { times } from 'lodash';
import { useRef } from 'react';
import { useIntersection } from '../../../../hooks/useIntersection';
import { tankPerformanceSortTypeNamesArray } from '../../../../stores/tankPerformanceSort';

interface RowLoaderProps {
  onIntersection?: () => void;
}

export function RowLoader({ onIntersection }: RowLoaderProps) {
  const row = useRef<HTMLTableRowElement>(null);

  useIntersection(() => onIntersection?.(), row, {
    disabled: onIntersection === undefined,
  });

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
