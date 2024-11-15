import {
  CaretDownIcon,
  CaretSortIcon,
  CaretUpIcon,
} from '@radix-ui/react-icons';
import { Button, Flex, Table } from '@radix-ui/themes';
import { TankPerformanceSort } from '../../stores/tankPerformanceSort';
import {
  TankPerformanceSortTypeNames,
  TankPerformanceSortTypeNamesArray,
} from '../../stores/tankPerformanceSort/constants';
import { StickyColumnHeaderCell } from '../StickyColumnHeaderCell';

export function Header() {
  const sort = TankPerformanceSort.use();
  const store = TankPerformanceSort.useStore();

  return (
    <Table.Header>
      <Table.Row align="center">
        <StickyColumnHeaderCell>Tank</StickyColumnHeaderCell>
        {TankPerformanceSortTypeNamesArray.map((type) => {
          const isSelected = sort.type === type;

          return (
            <StickyColumnHeaderCell
              px="2"
              key={type}
              width="0"
              justify="center"
            >
              <Flex align="center" gap="1">
                <Button
                  variant="ghost"
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
                  {TankPerformanceSortTypeNames[type]}

                  {!isSelected && <CaretSortIcon />}
                  {isSelected && (
                    <>
                      {sort.direction === 1 && <CaretUpIcon />}
                      {sort.direction === -1 && <CaretDownIcon />}
                    </>
                  )}
                </Button>
              </Flex>
            </StickyColumnHeaderCell>
          );
        })}
      </Table.Row>
    </Table.Header>
  );
}
