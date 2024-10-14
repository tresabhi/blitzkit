import { Flex, Table } from '@radix-ui/themes';
import { AdResponsiveHorizontal } from './AdResponsiveHorizontal';

interface AdStickyTableRowProps {
  id: string;
}

export function AdStickyTableRow({ id }: AdStickyTableRowProps) {
  return (
    <Table.Body style={{ height: 250 }}>
      <Table.Row align="center">
        <Flex
          justify="center"
          align="center"
          position="absolute"
          width="100%"
          left="0"
        >
          <AdResponsiveHorizontal id={id} />
        </Flex>
      </Table.Row>
    </Table.Body>
  );
}
