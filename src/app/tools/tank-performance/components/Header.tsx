import { Table } from '@radix-ui/themes';

export function Header() {
  return (
    <Table.Header>
      <Table.Row align="end">
        <Table.ColumnHeaderCell>Tank</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center">
          Winrate
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center">
          Players
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center">
          Damage
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center">
          Survival
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center">
          XP
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center">
          Kills
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center">
          Spots
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center">
          Accuracy
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center">
          Shots
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center">
          Hits
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center">
          Damage ratio
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center">
          Damage received
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center">
          Capture points
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center">
          Dropped capture points
        </Table.ColumnHeaderCell>
      </Table.Row>
    </Table.Header>
  );
}
