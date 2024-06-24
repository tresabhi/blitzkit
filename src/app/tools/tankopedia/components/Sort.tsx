import { CaretDownIcon } from '@radix-ui/react-icons';
import { Button, DropdownMenu } from '@radix-ui/themes';
import { TankopediaSortDirection } from '../../../../stores/tankopedia';
import {
  mutateTankopediaFilters,
  useTankopediaFilters,
} from '../../../../stores/tankopediaFilters';

export function Sort() {
  const sort = useTankopediaFilters((state) => state.sort);

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger>
        <Button variant="surface" color="gray">
          Sort
          <CaretDownIcon />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align="end">
        <DropdownMenu.Label>Sort by</DropdownMenu.Label>

        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Meta</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'meta.tier'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'meta.tier';
                });
              }}
            >
              Tier
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'meta.name'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'meta.name';
                });
              }}
            >
              Name
            </DropdownMenu.CheckboxItem>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Fire</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.dpm'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'fire.dpm';
                });
              }}
            >
              DPM
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.reload'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'fire.reload';
                });
              }}
            >
              Reload
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.caliber'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'fire.caliber';
                });
              }}
            >
              Caliber
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.standardPenetration'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'fire.standardPenetration';
                });
              }}
            >
              Standard penetration
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.premiumPenetration'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'fire.premiumPenetration';
                });
              }}
            >
              Premium penetration
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.damage'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'fire.damage';
                });
              }}
            >
              Damage
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.shellVelocity'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'fire.shellVelocity';
                });
              }}
            >
              Shell velocity
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.aimTime'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'fire.aimTime';
                });
              }}
            >
              Aim time
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.dispersionStill'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'fire.dispersionStill';
                });
              }}
            >
              Dispersion still
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.dispersionMoving'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'fire.dispersionMoving';
                });
              }}
            >
              Dispersion moving
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.gunDepression'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'fire.gunDepression';
                });
              }}
            >
              Gun depression
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'fire.gunElevation'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'fire.gunElevation';
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
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'maneuverability.forwardsSpeed';
                });
              }}
            >
              Forwards speed
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'maneuverability.backwardsSpeed'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'maneuverability.backwardsSpeed';
                });
              }}
            >
              Backwards speed
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'maneuverability.power'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'maneuverability.power';
                });
              }}
            >
              Power
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'maneuverability.powerToWeight'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'maneuverability.powerToWeight';
                });
              }}
            >
              Power to weight
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'maneuverability.weight'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'maneuverability.weight';
                });
              }}
            >
              Weight
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'maneuverability.traverseSpeed'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'maneuverability.traverseSpeed';
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
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'survivability.health';
                });
              }}
            >
              Health
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'survivability.viewRange'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'survivability.viewRange';
                });
              }}
            >
              View range
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'survivability.camouflageStill'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'survivability.camouflageStill';
                });
              }}
            >
              Camouflage
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'survivability.camouflageMoving'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'survivability.camouflageMoving';
                });
              }}
            >
              Camouflage moving
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'survivability.camouflageShooting'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'survivability.camouflageShooting';
                });
              }}
            >
              Camouflage shooting
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'survivability.volume'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'survivability.volume';
                });
              }}
            >
              Volume
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={sort.by === 'survivability.length'}
              onClick={() => {
                mutateTankopediaFilters((draft) => {
                  draft.sort.by = 'survivability.length';
                });
              }}
            >
              Length
            </DropdownMenu.CheckboxItem>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Separator />

        <DropdownMenu.Label>Direction</DropdownMenu.Label>
        <DropdownMenu.RadioGroup
          value={sort.direction}
          onValueChange={(value) =>
            mutateTankopediaFilters((draft) => {
              draft.sort.direction = value as TankopediaSortDirection;
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
