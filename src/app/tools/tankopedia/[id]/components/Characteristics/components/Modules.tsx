import { Button, Flex, Heading } from '@radix-ui/themes';
import { ModuleManager } from '../../../../../../../components/ModuleManager';
import { mutateDuel, useDuel } from '../../../../../../../stores/duel';
import { mutateTankopediaTemporary } from '../../../../../../../stores/tankopedia';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Modules() {
  const protagonist = useDuel((state) => state.protagonist!);
  const hasUpgrades =
    protagonist.tank.turrets.length > 1 ||
    protagonist.tank.turrets[0].guns.length > 1 ||
    protagonist.tank.engines.length > 1 ||
    protagonist.tank.tracks.length > 1;

  return (
    <ConfigurationChildWrapper>
      <Flex gap="4" align="center">
        <Heading size="4">Modules</Heading>
        {hasUpgrades && (
          <>
            <Button
              variant="ghost"
              color="red"
              onClick={() => {
                mutateDuel((draft) => {
                  draft.protagonist!.turret =
                    draft.protagonist!.tank.turrets[0];
                  draft.protagonist!.gun = draft.protagonist!.turret.guns[0];
                  draft.protagonist!.shell = draft.protagonist!.gun.shells[0];
                  draft.protagonist!.engine =
                    draft.protagonist!.tank.engines[0];
                  draft.protagonist!.track = draft.protagonist!.tank.tracks[0];
                });
              }}
            >
              Stock
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                mutateDuel((draft) => {
                  draft.protagonist!.turret =
                    draft.protagonist!.tank.turrets.at(-1)!;
                  draft.protagonist!.gun =
                    draft.protagonist!.turret.guns.at(-1)!;
                  draft.protagonist!.shell =
                    draft.protagonist!.gun.shells.at(-1)!;
                  draft.protagonist!.engine =
                    draft.protagonist!.tank.engines.at(-1)!;
                  draft.protagonist!.track =
                    draft.protagonist!.tank.tracks.at(-1)!;
                });
              }}
            >
              Upgrade
            </Button>
          </>
        )}
      </Flex>

      <ModuleManager
        tank={protagonist.tank}
        turret={protagonist.turret}
        gun={protagonist.gun}
        shell={protagonist.shell}
        engine={protagonist.engine}
        track={protagonist.track}
        onChange={(modules) => {
          mutateDuel((draft) => {
            draft.protagonist = { ...draft.protagonist!, ...modules };
          });
          mutateTankopediaTemporary((draft) => {
            draft.shot = undefined;
          });
        }}
      />
    </ConfigurationChildWrapper>
  );
}
