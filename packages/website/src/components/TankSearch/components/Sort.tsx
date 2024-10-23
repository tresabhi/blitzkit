import { useStore } from '@nanostores/react';
import { CaretDownIcon } from '@radix-ui/react-icons';
import { Button, DropdownMenu } from '@radix-ui/themes';
import type { TankopediaSortDirection } from '../../../stores/tankopediaPersistent';
import { $tankopediaSort } from '../../../stores/tankopediaSort';

export function Sort() {
  const tankopediaSort = useStore($tankopediaSort);

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
          checked={tankopediaSort.by === 'meta.none'}
          onClick={() => {
            // mutateTankopediaSort((draft) => {
            //   draft.by = 'meta.none';
            // });
            $tankopediaSort.setKey('by', 'meta.none');
          }}
        >
          No sort
        </DropdownMenu.CheckboxItem>

        <DropdownMenu.Label>Sort by</DropdownMenu.Label>

        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Fire</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'fire.dpm'}
              onClick={() => {
                // mutateTankopediaSort((draft) => {
                //   draft.by = 'fire.dpm';
                // });
                $tankopediaSort.setKey('by', 'fire.dpm');
              }}
            >
              Standard DPM
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'fire.dpmPremium'}
              onClick={() => {
                // mutateTankopediaSort((draft) => {
                //   draft.by = 'fire.dpmPremium';
                // });
                $tankopediaSort.setKey('by', 'fire.dpmPremium');
              }}
            >
              Premium DPM
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'fire.reload'}
              onClick={() => {
                // mutateTankopediaSort((draft) => {
                //   draft.by = 'fire.reload';
                // });
                $tankopediaSort.setKey('by', 'fire.reload');
              }}
            >
              Reload
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'fire.caliber'}
              onClick={() => {
                // mutateTankopediaSort((draft) => {
                //   draft.by = 'fire.caliber';
                // });
                $tankopediaSort.setKey('by', 'fire.caliber');
              }}
            >
              Caliber
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'fire.standardPenetration'}
              onClick={() => {
                // mutateTankopediaSort((draft) => {
                //   draft.by = 'fire.standardPenetration';
                // });
                $tankopediaSort.setKey('by', 'fire.standardPenetration');
              }}
            >
              Standard penetration
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'fire.premiumPenetration'}
              onClick={() => {
                // mutateTankopediaSort((draft) => {
                //   draft.by = 'fire.premiumPenetration';
                // });
                $tankopediaSort.setKey('by', 'fire.premiumPenetration');
              }}
            >
              Premium penetration
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'fire.damage'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'fire.damage');
              }}
            >
              Damage
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'fire.shellVelocity'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'fire.shellVelocity');
              }}
            >
              Shell velocity
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'fire.aimTime'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'fire.aimTime');
              }}
            >
              Aim time
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'fire.dispersionStill'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'fire.dispersionStill');
              }}
            >
              Dispersion still
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'fire.dispersionMoving'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'fire.dispersionMoving');
              }}
            >
              Dispersion moving
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'fire.gunDepression'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'fire.gunDepression');
              }}
            >
              Gun depression
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'fire.gunElevation'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'fire.gunElevation');
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
              checked={tankopediaSort.by === 'maneuverability.forwardsSpeed'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'maneuverability.forwardsSpeed');
              }}
            >
              Forwards speed
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'maneuverability.backwardsSpeed'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'maneuverability.backwardsSpeed');
              }}
            >
              Backwards speed
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'maneuverability.power'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'maneuverability.power');
              }}
            >
              Power
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'maneuverability.powerToWeight'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'maneuverability.powerToWeight');
              }}
            >
              Power to weight
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'maneuverability.weight'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'maneuverability.weight');
              }}
            >
              Weight
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'maneuverability.traverseSpeed'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'maneuverability.traverseSpeed');
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
              checked={tankopediaSort.by === 'survivability.health'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'survivability.health');
              }}
            >
              Health
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'survivability.viewRange'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'survivability.viewRange');
              }}
            >
              View range
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'survivability.camouflageStill'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'survivability.camouflageStill');
              }}
            >
              Camouflage
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'survivability.camouflageMoving'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'survivability.camouflageMoving');
              }}
            >
              Camouflage moving
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'survivability.camouflageShooting'}
              onClick={() => {
                $tankopediaSort.setKey(
                  'by',
                  'survivability.camouflageShooting',
                );
              }}
            >
              Camouflage shooting
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'survivability.volume'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'survivability.volume');
              }}
            >
              Volume
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={tankopediaSort.by === 'survivability.length'}
              onClick={() => {
                $tankopediaSort.setKey('by', 'survivability.length');
              }}
            >
              Length
            </DropdownMenu.CheckboxItem>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Label>Direction</DropdownMenu.Label>
        <DropdownMenu.RadioGroup
          value={tankopediaSort.direction}
          onValueChange={(value) => {
            $tankopediaSort.setKey(
              'direction',
              value as TankopediaSortDirection,
            );
          }}
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
