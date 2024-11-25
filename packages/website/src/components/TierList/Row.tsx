import { fetchTankDefinitions } from '@blitzkit/core';
import { Flex, Heading, Table } from '@radix-ui/themes';
import { useEffect, useRef } from 'react';
import { Var } from '../../core/radix/var';
import { TierList } from '../../stores/tierList';
import { tierListRowElements, tierListRows } from './Table/constants';
import { TierListTile } from './Tile';

interface TierListRowProps {
  index: number;
}

const tankDefinitions = await fetchTankDefinitions();

export function TierListRow({ index }: TierListRowProps) {
  const rowStyle = tierListRows[index];
  const tanks = TierList.use((state) => state.tanks[index]);
  const row = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (!row.current) return;

    tierListRowElements.add(row.current);

    return () => {
      if (!row.current) return;

      tierListRowElements.delete(row.current);
    };
  });

  return (
    <Table.Row key={rowStyle.name} ref={row} data-index={index}>
      <Table.RowHeaderCell
        width="0"
        style={{ backgroundColor: Var(rowStyle.color) }}
      >
        <Heading>{rowStyle.name}</Heading>
      </Table.RowHeaderCell>

      <Table.Cell>
        <Flex wrap="wrap" height="100%" gap="2">
          {tanks.map((id, tankIndex) => {
            const tank = tankDefinitions.tanks[id];
            return (
              <TierListTile
                isPlaced
                key={id}
                tank={tank}
                rowIndex={index}
                tileIndex={tankIndex}
              />
            );
          })}
        </Flex>
      </Table.Cell>
    </Table.Row>
  );
}
