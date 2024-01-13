import {
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  GearIcon,
} from '@radix-ui/react-icons';
import { Button, DropdownMenu, Flex } from '@radix-ui/themes';
import { RefObject } from 'react';
import mutateTankopedia, {
  useTankopedia,
} from '../../../../../../../stores/tankopedia';

interface OptionsProps {
  isFullScreen: boolean;
  canvas: RefObject<HTMLElement>;
}

export function Options({ isFullScreen, canvas }: OptionsProps) {
  const showGrid = useTankopedia((state) => state.model.showGrid);
  const showSpacedArmor = useTankopedia((state) => state.model.showSpacedArmor);

  return (
    <Flex
      gap="4"
      style={{
        position: 'absolute',
        top: 18,
        right: 18,
      }}
    >
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button color={showGrid ? 'purple' : 'gray'} variant="ghost">
            <GearIcon />
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem
            checked={showGrid}
            onCheckedChange={(checked) => {
              mutateTankopedia((draft) => {
                draft.model.showGrid = checked;
              });
            }}
          >
            Show grid
          </DropdownMenu.CheckboxItem>

          <DropdownMenu.CheckboxItem
            checked={showSpacedArmor}
            onCheckedChange={(checked) => {
              mutateTankopedia((draft) => {
                draft.model.showSpacedArmor = checked;
              });
            }}
          >
            Spaced armor
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <Button
        variant="ghost"
        onClick={() => {
          if (isFullScreen) {
            document.exitFullscreen();
          } else {
            canvas.current?.requestFullscreen();
          }
        }}
      >
        {isFullScreen ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
      </Button>
    </Flex>
  );
}
