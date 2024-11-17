import { fetchTankDefinitions } from '@blitzkit/core';
import { Flex, Heading, Table } from '@radix-ui/themes';
import { Fragment } from 'react';
import { Var } from '../../core/radix/var';
import { TierList } from '../../stores/tierList';
import { DropOff } from './DropOff';
import { tierListRows } from './Table/constants';
import { TierListTile } from './Tile';

interface TierListRowProps {
  index: number;
}

const tankDefinitions = await fetchTankDefinitions();

export function TierListRow({ index }: TierListRowProps) {
  const row = tierListRows[index];
  const tanks = TierList.use((state) => state.tanks[index]);

  return (
    <Table.Row key={row.name}>
      <Table.RowHeaderCell
        width="0"
        style={{ backgroundColor: Var(row.color) }}
      >
        <Heading>{row.name}</Heading>
      </Table.RowHeaderCell>

      <Table.Cell>
        <Flex wrap="wrap" height="100%" gap="2">
          <DropOff row={index} index={0} />

          {tanks.map((id, tankIndex) => {
            const tank = tankDefinitions.tanks[id];

            return (
              <Fragment key={id}>
                <TierListTile tank={tank} />
                <DropOff row={index} index={tankIndex + 1} />
              </Fragment>
            );
          })}
        </Flex>
      </Table.Cell>
    </Table.Row>
  );
}
