import { Flex, Table } from '@radix-ui/themes';
import { Ad } from './Ad';

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
          <Ad commonHeight={250} id={id} />
        </Flex>
      </Table.Row>
    </Table.Body>
  );
}
