'use client';

import {
  CaretDownIcon,
  CaretSortIcon,
  CaretUpIcon,
} from '@radix-ui/react-icons';
import { Flex, IconButton, Table } from '@radix-ui/themes';
import {
  tankPerformanceSortTypeNames,
  tankPerformanceSortTypeNamesArray,
  useTankPerformanceSort,
} from '../../../../stores/tankPerformanceSort';

export function Header() {
  const sort = useTankPerformanceSort();

  return (
    <Table.Header style={{ whiteSpace: 'nowrap' }}>
      <Table.Row align="center">
        <Table.ColumnHeaderCell>Tank</Table.ColumnHeaderCell>
        {tankPerformanceSortTypeNamesArray.map((type) => {
          const isSelected = sort.type === type;

          return (
            <Table.ColumnHeaderCell
              key={type}
              width="0"
              justify="center"
              minWidth="0px"
            >
              <Flex align="center" gap="1">
                {tankPerformanceSortTypeNames[type]}

                <IconButton
                  size={isSelected ? '1' : '2'}
                  variant={isSelected ? 'soft' : 'ghost'}
                  color={isSelected ? undefined : 'gray'}
                  highContrast={!isSelected}
                  onClick={() => {
                    if (isSelected) {
                      useTankPerformanceSort.setState({
                        direction: -sort.direction as 1 | -1,
                      });
                    } else {
                      useTankPerformanceSort.setState({ type, direction: -1 });
                    }
                  }}
                >
                  {!isSelected && <CaretSortIcon />}
                  {isSelected && (
                    <>
                      {sort.direction === 1 && <CaretUpIcon />}
                      {sort.direction === -1 && <CaretDownIcon />}
                    </>
                  )}
                </IconButton>
              </Flex>
            </Table.ColumnHeaderCell>
          );
        })}
      </Table.Row>
    </Table.Header>
  );
}
