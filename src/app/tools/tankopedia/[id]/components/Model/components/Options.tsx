import {
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  EyeOpenIcon,
  GearIcon,
} from '@radix-ui/react-icons';
import { Button, DropdownMenu, Flex } from '@radix-ui/themes';
import { RefObject } from 'react';
import { Pose, poseEvent } from '../../../../../../../core/blitzkit/pose';
import { useApp } from '../../../../../../../stores/app';
import mutateTankopediaPersistent, {
  mutateTankopediaTemporary,
  useTankopediaPersistent,
} from '../../../../../../../stores/tankopedia';
import { ENVIRONMENTS } from '../../Lighting';

interface OptionsProps {
  isFullScreen: boolean;
  canvasWrapper: RefObject<HTMLElement>;
}

export function Options({ isFullScreen }: OptionsProps) {
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
  const showSpacedArmor = useTankopediaPersistent(
    (state) => state.model.visual.showSpacedArmor,
  );
  const opaque = useTankopediaPersistent((state) => state.model.visual.opaque);
  const fullScreenAvailable =
    typeof document !== 'undefined' && document.fullscreenEnabled;
  const environment = useTankopediaPersistent(
    (state) => state.model.visual.environment,
  );
  const developerMode = useApp((state) => state.developerMode);

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
          <DropdownMenu.Label>Armor</DropdownMenu.Label>

          <DropdownMenu.CheckboxItem
            checked={showSpacedArmor}
            onCheckedChange={(checked) => {
              mutateTankopediaPersistent((draft) => {
                draft.model.visual.showSpacedArmor = checked;
              });
              mutateTankopediaTemporary((draft) => {
                draft.shot = undefined;
              });
            }}
          >
            Spaced armor
          </DropdownMenu.CheckboxItem>

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

          {developerMode && (
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
          )}

          <DropdownMenu.CheckboxItem
            checked={opaque}
            onCheckedChange={(checked) => {
              mutateTankopediaPersistent((draft) => {
                draft.model.visual.opaque = checked;
              });
            }}
          >
            Opaque
          </DropdownMenu.CheckboxItem>

          <DropdownMenu.Label>Environment</DropdownMenu.Label>

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
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      {fullScreenAvailable && (
        <Button
          variant="ghost"
          onClick={() => {
            if (isFullScreen) {
              document.exitFullscreen();
            } else document.body.requestFullscreen();
          }}
        >
          {isFullScreen ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
        </Button>
      )}
    </Flex>
  );
}
