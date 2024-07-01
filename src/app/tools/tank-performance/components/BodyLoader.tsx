import { Table } from '@radix-ui/themes';
import { times } from 'lodash';
import { RowLoader } from './RowLoader';

export function BodyLoader() {
  return (
    <Table.Body>
      {times(10, (index) => (
        <RowLoader key={index} />
      ))}
    </Table.Body>
  );
}
