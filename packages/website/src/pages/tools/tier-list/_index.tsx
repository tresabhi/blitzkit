import { Heading, Table } from '@radix-ui/themes';
import { PageWrapper } from '../../../components/PageWrapper';
import { Var, type VarName } from '../../../core/radix/var';

export function Page() {
  return <Content />;
}

const rows: {
  name: string;
  color: VarName;
}[] = [
  { name: 'S', color: 'tomato-9' },
  { name: 'A', color: 'orange-9' },
  { name: 'B', color: 'amber-9' },
  { name: 'C', color: 'green-9' },
  { name: 'D', color: 'blue-9' },
];

function Content() {
  return (
    <PageWrapper color="orange">
      <Table.Root variant="surface">
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={row.name}>
              <Table.RowHeaderCell
                width="0"
                style={{ backgroundColor: Var(row.color) }}
              >
                <Heading>{row.name}</Heading>
              </Table.RowHeaderCell>

              <Table.Cell></Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </PageWrapper>
  );
}
