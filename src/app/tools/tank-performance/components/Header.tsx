import { Table } from '@radix-ui/themes';

export function Header() {
  return (
    <Table.Header style={{ whiteSpace: 'nowrap' }}>
      <Table.Row align="end">
        <Table.ColumnHeaderCell>Tank</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center" minWidth="0px">
          Winrate
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center" minWidth="0px">
          Players (30d)
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center" minWidth="0px">
          Damage
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center" minWidth="0px">
          Survival
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center" minWidth="0px">
          XP
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center" minWidth="0px">
          Kills
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center" minWidth="0px">
          Spots
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center" minWidth="0px">
          Accuracy
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center" minWidth="0px">
          Shots
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center" minWidth="0px">
          Hits
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center" minWidth="0px">
          Dmg. ratio
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center" minWidth="0px">
          Dmg. taken
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell width="0" justify="center" minWidth="0px">
          Cap points
        </Table.ColumnHeaderCell>
      </Table.Row>
    </Table.Header>
  );
}
