'use client';

import {
  CaretDownIcon,
  CaretSortIcon,
  CaretUpIcon,
} from '@radix-ui/react-icons';
import { Flex, IconButton, Table } from '@radix-ui/themes';
import * as TankPerformanceSort from '../../../../stores/tankPerformanceSort';
import {
  tankPerformanceSortTypeNames,
  tankPerformanceSortTypeNamesArray,
} from '../../../../stores/tankPerformanceSort/constants';

export function Header() {
  const sort = TankPerformanceSort.use();
  const store = TankPerformanceSort.useStore();

  return (
    <Table.Header>
      <Table.Row align="center">
        <Table.ColumnHeaderCell>Tank</Table.ColumnHeaderCell>
        {tankPerformanceSortTypeNamesArray.map((type) => {
          const isSelected = sort.type === type;

          return (
            <Table.ColumnHeaderCell
              px="2"
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
                      store.setState({ direction: -sort.direction as 1 | -1 });
                    } else {
                      store.setState({ type, direction: -1 });
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
