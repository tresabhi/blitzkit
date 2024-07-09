import { CaretDownIcon } from '@radix-ui/react-icons';
import { Button, DropdownMenu } from '@radix-ui/themes';
import { TankopediaSortDirection } from '../../../../stores/tankopediaPersistent';
import * as TankopediaSort from '../../../../stores/tankopediaSort';

export function Sort() {
  const sort = TankopediaSort.use();
  const mutateTankopediaSort = TankopediaSort.useMutation();

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger>
        <Button variant="surface" color="gray">
          Sort
          <CaretDownIcon />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align="end">
        <DropdownMenu.CheckboxItem
          checked={sort.by === 'meta.none'}
          onClick={() => {
            mutateTankopediaSort((draft) => {
              draft.by = 'meta.none';
            });
          }}
        >
          No sort
        </DropdownMenu.CheckboxItem>

        <DropdownMenu.Label>Sort by</DropdownMenu.Label>

        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Fire</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.dpm'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'fire.dpm';
                });
              }}
            >
              Standard DPM
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.dpmPremium'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'fire.dpmPremium';
                });
              }}
            >
              Premium DPM
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.reload'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'fire.reload';
                });
              }}
            >
              Reload
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.caliber'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'fire.caliber';
                });
              }}
            >
              Caliber
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.standardPenetration'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'fire.standardPenetration';
                });
              }}
            >
              Standard penetration
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.premiumPenetration'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'fire.premiumPenetration';
                });
              }}
            >
              Premium penetration
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.damage'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'fire.damage';
                });
              }}
            >
              Damage
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.shellVelocity'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'fire.shellVelocity';
                });
              }}
            >
              Shell velocity
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.aimTime'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'fire.aimTime';
                });
              }}
            >
              Aim time
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.dispersionStill'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'fire.dispersionStill';
                });
              }}
            >
              Dispersion still
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.dispersionMoving'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'fire.dispersionMoving';
                });
              }}
            >
              Dispersion moving
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.gunDepression'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'fire.gunDepression';
                });
              }}
            >
              Gun depression
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.gunElevation'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'fire.gunElevation';
                });
              }}
            >
              Gun elevation
            </DropdownMenu.CheckboxItem>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Maneuverability</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'maneuverability.forwardsSpeed'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'maneuverability.forwardsSpeed';
                });
              }}
            >
              Forwards speed
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'maneuverability.backwardsSpeed'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'maneuverability.backwardsSpeed';
                });
              }}
            >
              Backwards speed
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'maneuverability.power'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'maneuverability.power';
                });
              }}
            >
              Power
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'maneuverability.powerToWeight'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'maneuverability.powerToWeight';
                });
              }}
            >
              Power to weight
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'maneuverability.weight'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'maneuverability.weight';
                });
              }}
            >
              Weight
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'maneuverability.traverseSpeed'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'maneuverability.traverseSpeed';
                });
              }}
            >
              Traverse speed
            </DropdownMenu.CheckboxItem>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Survivability</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'survivability.health'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'survivability.health';
                });
              }}
            >
              Health
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'survivability.viewRange'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'survivability.viewRange';
                });
              }}
            >
              View range
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'survivability.camouflageStill'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'survivability.camouflageStill';
                });
              }}
            >
              Camouflage
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'survivability.camouflageMoving'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'survivability.camouflageMoving';
                });
              }}
            >
              Camouflage moving
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'survivability.camouflageShooting'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'survivability.camouflageShooting';
                });
              }}
            >
              Camouflage shooting
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'survivability.volume'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'survivability.volume';
                });
              }}
            >
              Volume
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'survivability.length'}
              onClick={() => {
                mutateTankopediaSort((draft) => {
                  draft.by = 'survivability.length';
                });
              }}
            >
              Length
            </DropdownMenu.CheckboxItem>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Label>Direction</DropdownMenu.Label>
        <DropdownMenu.RadioGroup
          value={sort.direction}
          onValueChange={(value) =>
            mutateTankopediaSort((draft) => {
              draft.direction = value as TankopediaSortDirection;
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
  );
}
