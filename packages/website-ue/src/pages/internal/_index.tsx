import { Link, Table } from '@radix-ui/themes';
import { PageWrapper } from '../../components/PageWrapper';

export function Page() {
  return (
    <PageWrapper>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Memo</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <Link href="internal/ffi">FFI</Link>
            </Table.Cell>
            <Table.Cell>
              Status of BlitzKit's currently mounted foreign function interface
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <Link href="internal/ffi">Client</Link>
            </Table.Cell>
            <Table.Cell>
              Location and information of the currently mounted client
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <Link href="/internal/bindings">Bindings</Link>
            </Table.Cell>
            <Table.Cell>
              Exhaustive list of all bindings and preference of currently
              mounted client
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </PageWrapper>
  );
}
