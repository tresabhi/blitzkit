import {
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  EyeOpenIcon,
  GearIcon,
} from '@radix-ui/react-icons';
import { Button, DropdownMenu, Flex } from '@radix-ui/themes';
import { RefObject } from 'react';
import { Pose, poseEvent } from '../../../../../../../core/blitzkrieg/pose';
import mutateTankopedia, {
  useTankopedia,
} from '../../../../../../../stores/tankopedia';

interface OptionsProps {
  isFullScreen: boolean;
  canvas: RefObject<HTMLElement>;
}

export function Options({ isFullScreen, canvas }: OptionsProps) {
  const showGrid = useTankopedia((state) => state.model.visual.showGrid);
  const greenPenetration = useTankopedia(
    (state) => state.model.visual.greenPenetration,
  );
  const fullScreenAvailable = document.fullscreenEnabled;

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
            <EyeOpenIcon />
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          <DropdownMenu.Item
            onClick={() => {
              console.log('called?');
              poseEvent.emit(Pose.HullDown);
            }}
          >
            Hull down
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

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
                draft.model.visual.showGrid = checked;
              });
            }}
          >
            Show grid
          </DropdownMenu.CheckboxItem>

          <DropdownMenu.CheckboxItem
            checked={greenPenetration}
            onCheckedChange={(checked) => {
              mutateTankopedia((draft) => {
                draft.model.visual.greenPenetration = checked;
              });
            }}
          >
            Green penetration
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      {fullScreenAvailable && (
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
      )}
    </Flex>
  );
}
