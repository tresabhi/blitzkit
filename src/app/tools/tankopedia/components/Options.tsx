import { CaretDownIcon } from '@radix-ui/react-icons';
import { Button, DropdownMenu, Flex } from '@radix-ui/themes';
import {
  TankopediaSortBy,
  TankopediaSortDirection,
  useTankopedia,
} from '../../../../stores/tankopedia';

export function Options() {
  const tankopediaState = useTankopedia();

  return (
    <Flex gap="2">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button variant="soft">
            Sort by
            <CaretDownIcon />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.RadioGroup
            value={tankopediaState.sortBy}
            onValueChange={(value) =>
              useTankopedia.setState({ sortBy: value as TankopediaSortBy })
            }
          >
            <DropdownMenu.RadioItem value="tier">Tier</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button variant="soft">
            Sort order
            <CaretDownIcon />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.RadioGroup
            value={tankopediaState.sortDirection}
            onValueChange={(value) =>
              useTankopedia.setState({
                sortDirection: value as TankopediaSortDirection,
              })
            }
          >
            <DropdownMenu.RadioItem value="ascending">
              Ascending
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="descending">
              Descending
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Flex>
  );
}
