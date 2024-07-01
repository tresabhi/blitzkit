import { Skeleton, Table } from '@radix-ui/themes';
import { times } from 'lodash';

export function RowLoader() {
  return (
    <Table.Row>
      <Table.RowHeaderCell align="center">
        <Skeleton height="100%" width="128px" />
      </Table.RowHeaderCell>

      {times(13, (index) => (
        <Table.Cell key={index} align="center">
          <Skeleton height="1em" width="32px" />
        </Table.Cell>
      ))}
    </Table.Row>
  );
}
