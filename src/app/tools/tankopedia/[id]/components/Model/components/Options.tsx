import {
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  EyeOpenIcon,
  GearIcon,
} from '@radix-ui/react-icons';
import { Button, DropdownMenu, Flex } from '@radix-ui/themes';
import { RefObject } from 'react';
import { Pose, poseEvent } from '../../../../../../../core/blitzkrieg/pose';
import mutateTankopediaPersistent, {
  useTankopediaPersistent,
} from '../../../../../../../stores/tankopedia';
import { ENVIRONMENTS } from '../../Lighting';

interface OptionsProps {
  isFullScreen: boolean;
  canvas: RefObject<HTMLElement>;
}

export function Options({ isFullScreen, canvas }: OptionsProps) {
  const showGrid = useTankopediaPersistent(
    (state) => state.model.visual.showGrid,
  );
  const showEnvironment = useTankopediaPersistent(
    (state) => state.model.visual.showEnvironment,
  );
  const greenPenetration = useTankopediaPersistent(
    (state) => state.model.visual.greenPenetration,
  );
  const wireframe = useTankopediaPersistent(
    (state) => state.model.visual.wireframe,
  );
  const fullScreenAvailable =
    typeof document !== 'undefined' && document.fullscreenEnabled;
  const environment = useTankopediaPersistent(
    (state) => state.model.visual.environment,
  );

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
          <Button variant="ghost">
            <EyeOpenIcon />
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={() => poseEvent.emit(Pose.HullDown)}>
            Hull down
          </DropdownMenu.Item>

          <DropdownMenu.Item onClick={() => poseEvent.emit(Pose.FaceHug)}>
            Face hug
          </DropdownMenu.Item>

          <DropdownMenu.Item onClick={() => poseEvent.emit(Pose.Default)}>
            Default
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button variant="ghost">
            <GearIcon />
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem
            checked={greenPenetration}
            onCheckedChange={(checked) => {
              mutateTankopediaPersistent((draft) => {
                draft.model.visual.greenPenetration = checked;
              });
            }}
          >
            Green penetration
          </DropdownMenu.CheckboxItem>

          <DropdownMenu.CheckboxItem
            checked={showGrid}
            onCheckedChange={(checked) => {
              mutateTankopediaPersistent((draft) => {
                draft.model.visual.showGrid = checked;
              });
            }}
          >
            Show grid
          </DropdownMenu.CheckboxItem>

          <DropdownMenu.CheckboxItem
            checked={showEnvironment}
            onCheckedChange={(checked) => {
              mutateTankopediaPersistent((draft) => {
                draft.model.visual.showEnvironment = checked;
              });
            }}
          >
            View environment
          </DropdownMenu.CheckboxItem>

          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Lighting</DropdownMenu.SubTrigger>

            <DropdownMenu.SubContent>
              <DropdownMenu.RadioGroup value={environment}>
                {ENVIRONMENTS.map((environment) => (
                  <DropdownMenu.RadioItem
                    key={environment}
                    value={environment}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.model.visual.environment = environment;
                      });
                    }}
                  >
                    {environment[0].toUpperCase() + environment.slice(1)}
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>

          <DropdownMenu.CheckboxItem
            checked={wireframe}
            onCheckedChange={(checked) => {
              mutateTankopediaPersistent((draft) => {
                draft.model.visual.wireframe = checked;
              });
            }}
          >
            Wireframe
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
