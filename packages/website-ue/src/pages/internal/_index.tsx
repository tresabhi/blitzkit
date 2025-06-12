import { Link, Table } from '@radix-ui/themes';
import { PageWrapper } from '../../components/PageWrapper';

export function Page() {
  return (
    <PageWrapper align="center">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Path</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Memo</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <Table.Row>
            <Table.RowHeaderCell>
              <Link href="/internal/debug">Debug</Link>
            </Table.RowHeaderCell>
            <Table.Cell>
              Some debug information to check if everything is up
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.RowHeaderCell>
              <Link href="/internal/bindings">Bindings</Link>
            </Table.RowHeaderCell>
            <Table.Cell>List of all active bindings</Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.RowHeaderCell>
              <Link href="/internal/discovery">Discovery</Link>
            </Table.RowHeaderCell>
            <Table.Cell>List of all active discovery lists</Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.RowHeaderCell>
              <Link href="/internal/differ">Differ</Link>
            </Table.RowHeaderCell>
            <Table.Cell>Differentiate two branches</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </PageWrapper>
  );
}
