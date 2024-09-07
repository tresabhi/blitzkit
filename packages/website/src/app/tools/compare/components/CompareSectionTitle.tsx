import { Heading, Table } from '@radix-ui/themes';
import { times } from 'lodash';
import { StickyColumnHeaderCell } from '../../../../components/StickyColumnHeaderCell';
import * as CompareEphemeral from '../../../../stores/compareEphemeral';

export function CompareSectionTitle({ children }: { children: string }) {
  const memberCount = CompareEphemeral.use((state) => state.members.length);

  return (
    <Table.Header style={{ height: 48 }}>
      <Table.Row align="center">
        <StickyColumnHeaderCell top={137} style={{ left: 0, zIndex: 2 }}>
          <Heading size="4">{children}</Heading>
        </StickyColumnHeaderCell>

        {times(memberCount, (index) => (
          <StickyColumnHeaderCell key={index} top={137} />
        ))}
      </Table.Row>
    </Table.Header>
  );
}
