import {
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  EyeOpenIcon,
  GearIcon,
} from '@radix-ui/react-icons';
import { DropdownMenu, Flex, IconButton, Switch } from '@radix-ui/themes';
import { Pose, poseEvent } from '../../../../../../../core/blitzkit/pose';
import { useFullScreen } from '../../../../../../../hooks/useFullScreen';
import { useApp } from '../../../../../../../stores/app';
import mutateTankopediaPersistent, {
  mutateTankopediaTemporary,
  useTankopediaPersistent,
} from '../../../../../../../stores/tankopedia';
import { ENVIRONMENTS } from '../../Lighting';

export function Options() {
  const mode = useTankopediaPersistent((state) => state.mode);
  const isFullScreen = useFullScreen();
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
      align="center"
      style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <Flex
        style={{
          cursor: 'default',
          userSelect: 'none',
        }}
        align="center"
        gap="2"
        onClick={() => {
          mutateTankopediaPersistent((draft) => {
            draft.mode = draft.mode === 'armor' ? 'model' : 'armor';
          });
        }}
        mr="2"
      >
        <Switch size="1" checked={mode === 'armor'} />
        Armor
      </Flex>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" color="gray">
            <EyeOpenIcon />
          </IconButton>
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
          <IconButton variant="ghost" color="gray">
            <GearIcon />
          </IconButton>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          {mode === 'armor' && (
            <>
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
            </>
          )}

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
            {/* TODO: consider removing this? */}
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
        <IconButton
          color="gray"
          variant="ghost"
          onClick={() => {
            if (isFullScreen) {
              document.exitFullscreen();
            } else document.body.requestFullscreen();
          }}
        >
          {isFullScreen ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
        </IconButton>
      )}
    </Flex>
  );
}
