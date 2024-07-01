import { Skeleton, Table } from '@radix-ui/themes';
import { times } from 'lodash';

export function RowLoader() {
  return (
    <Table.Row>
      <Table.RowHeaderCell>
        <Skeleton height="100%" width="128px" />
      </Table.RowHeaderCell>

      {times(14, (index) => (
        <Table.Cell key={index}>
          <Skeleton height="1em" width="32px" />
        </Table.Cell>
      ))}
    </Table.Row>
  );
}
