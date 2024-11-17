import { Table } from '@radix-ui/themes';
import { TierListRow } from '../Row';
import { tierListRows } from './constants';

export function TierListTable() {
  return (
    <Table.Root variant="surface" mb="6">
      <Table.Body>
        {tierListRows.map((_, index) => (
          <TierListRow index={index} key={index} />
        ))}
      </Table.Body>
    </Table.Root>
  );
}
