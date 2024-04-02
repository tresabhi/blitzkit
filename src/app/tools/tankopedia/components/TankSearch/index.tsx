import { slateDark } from '@radix-ui/colors';
import {
  CaretDownIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import {
  Button,
  Card,
  DropdownMenu,
  Flex,
  Inset,
  Text,
  TextField,
} from '@radix-ui/themes';
import { go } from 'fuzzysort';
import { use, useEffect, useMemo, useRef, useState } from 'react';
import { TreeType } from '../../../../../components/Tanks';
import { TANK_CLASSES } from '../../../../../components/Tanks/components/Item/constants';
import { resolveNearPenetration } from '../../../../../core/blitz/resolveNearPenetration';
import { asset } from '../../../../../core/blitzkrieg/asset';
import { modelDefinitions } from '../../../../../core/blitzkrieg/modelDefinitions';
import { normalizeBoundingBox } from '../../../../../core/blitzkrieg/normalizeBoundingBox';
import { resolveDpm } from '../../../../../core/blitzkrieg/resolveDpm';
import { resolveReload } from '../../../../../core/blitzkrieg/resolveReload';
import {
  NATIONS,
  TankDefinition,
  tanksDefinitionsArray,
} from '../../../../../core/blitzkrieg/tankDefinitions';
import {
  TANK_ICONS,
  TANK_ICONS_COLLECTOR,
  TANK_ICONS_PREMIUM,
  TIER_ROMAN_NUMERALS,
} from '../../../../../core/blitzkrieg/tankDefinitions/constants';
import { tankIcon } from '../../../../../core/blitzkrieg/tankIcon';
import { unionBoundingBox } from '../../../../../core/blitzkrieg/unionBoundingBox';
import { theme } from '../../../../../stitches.config';
import mutateTankopediaPersistent, {
  SORT_NAMES,
  TankopediaSortDirection,
  useTankopediaPersistent,
} from '../../../../../stores/tankopedia';
import * as styles from '../../page.css';
import { PageTurner } from '../PageTurner';
import { CompactSearchResultRow } from './components/CompactSearchResultRow';
import { Options } from './components/Options';

interface TankSearchProps {
  compact?: boolean;
  onSelect?: (tank: TankDefinition) => void;
}

const treeTypeOrder: TreeType[] = ['researchable', 'premium', 'collector'];

export function TankSearch({ compact, onSelect = () => {} }: TankSearchProps) {
  const tanksPerPage = compact ? 16 : 96;
  const nations = use(NATIONS);
  const filters = useTankopediaPersistent((state) => state.filters);
  const sort = useTankopediaPersistent((state) => state.sort);
  const awaitedTanks = use(tanksDefinitionsArray);
  const awaitedModelDefinitions = use(modelDefinitions);
  const defaultSortedTanks = useMemo(
    () =>
      awaitedTanks
        .sort(
          (a, b) =>
            (treeTypeOrder.indexOf(a.treeType) -
              treeTypeOrder.indexOf(b.treeType)) *
            (sort.direction === 'descending' ? -1 : 1),
        )
        .sort(
          (a, b) =>
            (TANK_CLASSES.indexOf(a.class) - TANK_CLASSES.indexOf(b.class)) *
            (sort.direction === 'descending' ? -1 : 1),
        )
        .sort(
          (a, b) =>
            (nations.indexOf(a.nation) - nations.indexOf(b.nation)) *
            (sort.direction === 'descending' ? -1 : 1),
        ),
    [],
  );
  const input = useRef<HTMLInputElement>(null);
  const searchableTanks = useMemo(() => {
    const filtered = defaultSortedTanks.filter(
      (tank) =>
        (filters.tiers.length === 0
          ? true
          : filters.tiers.includes(tank.tier)) &&
        (filters.types.length === 0
          ? true
          : filters.types.includes(tank.class)) &&
        (filters.treeTypes.length === 0
          ? true
          : filters.treeTypes.includes(tank.treeType)) &&
        (filters.nations.length === 0
          ? true
          : filters.nations.includes(tank.nation)) &&
        (filters.test === 'include'
          ? true
          : filters.test === 'exclude'
            ? !tank.testing
            : tank.testing),
    );
    let sorted: TankDefinition[] = [];

    switch (sort.by) {
      case 'meta.tier':
        sorted = filtered.sort((a, b) => a.tier - b.tier);
        break;

      case 'meta.name':
        sorted = filtered.sort((a, b) => a.name?.localeCompare(b.name));
        break;

      case 'survivability.health': {
        sorted = filtered.sort((a, b) => {
          const aHealth = a.health + a.turrets.at(-1)!.health;
          const bHealth = b.health + b.turrets.at(-1)!.health;

          return aHealth - bHealth;
        });
        break;
      }

      case 'survivability.viewRange':
        sorted = filtered.sort(
          (a, b) => a.turrets.at(-1)!.viewRange - b.turrets.at(-1)!.viewRange,
        );
        break;

      case 'survivability.camouflageStill':
        sorted = filtered.sort(
          (a, b) => a.camouflage.still - b.camouflage.still,
        );
        break;

      case 'survivability.camouflageMoving':
        sorted = filtered.sort(
          (a, b) => a.camouflage.moving - b.camouflage.moving,
        );
        break;

      case 'survivability.camouflageShooting':
        sorted = filtered.sort(
          (a, b) =>
            a.turrets.at(-1)!.guns.at(-1)!.camouflageLoss -
            b.turrets.at(-1)!.guns.at(-1)!.camouflageLoss,
        );
        break;

      case 'survivability.volume':
        sorted = filtered.sort((a, b) => {
          const aTankModelDefinition = awaitedModelDefinitions[a.id];
          const bTankModelDefinition = awaitedModelDefinitions[b.id];
          const aTurretModelDefinition =
            aTankModelDefinition.turrets[a.turrets.at(-1)!.id];
          const bTurretModelDefinition =
            bTankModelDefinition.turrets[b.turrets.at(-1)!.id];
          const aSize = normalizeBoundingBox(
            unionBoundingBox(
              aTankModelDefinition.boundingBox,
              aTurretModelDefinition.boundingBox,
            ),
          );
          const bSize = normalizeBoundingBox(
            unionBoundingBox(
              bTankModelDefinition.boundingBox,
              bTurretModelDefinition.boundingBox,
            ),
          );
          const aVolume = aSize[0] * aSize[1] * aSize[2];
          const bVolume = bSize[0] * bSize[1] * bSize[2];

          return aVolume - bVolume;
        });
        break;

      case 'survivability.length':
        sorted = filtered.sort((a, b) => {
          const aTankModelDefinition = awaitedModelDefinitions[a.id];
          const bTankModelDefinition = awaitedModelDefinitions[b.id];
          const aTurretModelDefinition =
            aTankModelDefinition.turrets[a.turrets.at(-1)!.id];
          const bTurretModelDefinition =
            bTankModelDefinition.turrets[b.turrets.at(-1)!.id];
          const aSize = normalizeBoundingBox(
            unionBoundingBox(
              aTankModelDefinition.boundingBox,
              aTurretModelDefinition.boundingBox,
            ),
          );
          const bSize = normalizeBoundingBox(
            unionBoundingBox(
              bTankModelDefinition.boundingBox,
              bTurretModelDefinition.boundingBox,
            ),
          );
          const aLength = Math.max(aSize[0], aSize[1], aSize[2]);
          const bLength = Math.max(bSize[0], bSize[1], bSize[2]);

          return aLength - bLength;
        });
        break;

      case 'fire.dpm':
        sorted = filtered.sort(
          (a, b) =>
            resolveDpm(
              a.turrets.at(-1)!.guns.at(-1)!,
              a.turrets.at(-1)!.guns.at(-1)!.shells[0],
            ) -
            resolveDpm(
              b.turrets.at(-1)!.guns.at(-1)!,
              b.turrets.at(-1)!.guns.at(-1)!.shells[0],
            ),
        );
        break;

      case 'fire.reload':
        sorted = filtered.sort(
          (a, b) =>
            resolveReload(a.turrets.at(-1)!.guns.at(-1)!) -
            resolveReload(b.turrets.at(-1)!.guns.at(-1)!),
        );
        break;

      case 'fire.caliber':
        sorted = filtered.sort(
          (a, b) =>
            a.turrets.at(-1)!.guns.at(-1)!.shells[0].caliber -
            b.turrets.at(-1)!.guns.at(-1)!.shells[0].caliber,
        );
        break;

      case 'fire.standardPenetration':
        sorted = filtered.sort(
          (a, b) =>
            resolveNearPenetration(
              a.turrets.at(-1)!.guns.at(-1)!.shells[0].penetration,
            ) -
            resolveNearPenetration(
              b.turrets.at(-1)!.guns.at(-1)!.shells[0].penetration,
            ),
        );
        break;

      case 'fire.premiumPenetration':
        sorted = filtered.sort(
          (a, b) =>
            resolveNearPenetration(
              (
                a.turrets.at(-1)!.guns.at(-1)!.shells[1] ??
                a.turrets.at(-1)!.guns.at(-1)!.shells[0]
              ).penetration,
            ) -
            resolveNearPenetration(
              (
                b.turrets.at(-1)!.guns.at(-1)!.shells[1] ??
                b.turrets.at(-1)!.guns.at(-1)!.shells[0]
              ).penetration,
            ),
        );
        break;

      case 'fire.damage':
        sorted = filtered.sort(
          (a, b) =>
            a.turrets.at(-1)!.guns.at(-1)!.shells[0].damage.armor -
            b.turrets.at(-1)!.guns.at(-1)!.shells[0].damage.armor,
        );
        break;

      case 'fire.shellVelocity':
        sorted = filtered.sort(
          (a, b) =>
            a.turrets.at(-1)!.guns.at(-1)!.shells[0].speed -
            b.turrets.at(-1)!.guns.at(-1)!.shells[0].speed,
        );
        break;

      case 'fire.aimTime':
        sorted = filtered.sort(
          (a, b) =>
            a.turrets.at(-1)!.guns.at(-1)!.aimTime -
            b.turrets.at(-1)!.guns.at(-1)!.aimTime,
        );
        break;

      case 'fire.dispersionStill':
        sorted = filtered.sort(
          (a, b) =>
            a.turrets.at(-1)!.guns.at(-1)!.dispersion.base -
            b.turrets.at(-1)!.guns.at(-1)!.dispersion.base,
        );
        break;

      case 'fire.dispersionMoving':
        sorted = filtered.sort(
          (a, b) =>
            a.tracks.at(-1)!.dispersion.move - b.tracks.at(-1)!.dispersion.move,
        );
        break;

      case 'fire.gunDepression':
        sorted = filtered.sort(
          (a, b) =>
            awaitedModelDefinitions[a.id].turrets[a.turrets.at(-1)!.id].guns[
              a.turrets.at(-1)!.guns.at(-1)!.id
            ].pitch.max -
            awaitedModelDefinitions[b.id].turrets[b.turrets.at(-1)!.id].guns[
              b.turrets.at(-1)!.guns.at(-1)!.id
            ].pitch.max,
        );
        break;

      case 'fire.gunElevation':
        sorted = filtered.sort(
          (a, b) =>
            // reversed because of negative values
            awaitedModelDefinitions[b.id].turrets[b.turrets.at(-1)!.id].guns[
              b.turrets.at(-1)!.guns.at(-1)!.id
            ].pitch.min -
            awaitedModelDefinitions[a.id].turrets[a.turrets.at(-1)!.id].guns[
              a.turrets.at(-1)!.guns.at(-1)!.id
            ].pitch.min,
        );
        break;

      case 'maneuverability.forwardsSpeed':
        sorted = filtered.sort((a, b) => a.speed.forwards - b.speed.forwards);
        break;

      case 'maneuverability.backwardsSpeed':
        sorted = filtered.sort((a, b) => a.speed.backwards - b.speed.backwards);
        break;

      case 'maneuverability.power':
        sorted = filtered.sort(
          (a, b) => a.engines.at(-1)!.power - b.engines.at(-1)!.power,
        );
        break;

      case 'maneuverability.powerToWeight':
        sorted = filtered.sort(
          (a, b) =>
            a.engines.at(-1)!.power /
              (a.weight +
                a.engines.at(-1)!.weight +
                a.tracks.at(-1)!.weight +
                a.turrets.at(-1)!.weight +
                a.turrets.at(-1)!.guns.at(-1)!.weight) -
            b.engines.at(-1)!.power /
              (b.weight +
                b.engines.at(-1)!.weight +
                b.tracks.at(-1)!.weight +
                b.turrets.at(-1)!.weight +
                b.turrets.at(-1)!.guns.at(-1)!.weight),
        );
        break;

      case 'maneuverability.weight':
        sorted = filtered.sort(
          (a, b) =>
            a.weight +
            a.engines.at(-1)!.weight +
            a.tracks.at(-1)!.weight +
            a.turrets.at(-1)!.weight +
            a.turrets.at(-1)!.guns.at(-1)!.weight -
            (b.weight +
              b.engines.at(-1)!.weight +
              b.tracks.at(-1)!.weight +
              b.turrets.at(-1)!.weight +
              b.turrets.at(-1)!.guns.at(-1)!.weight),
        );
        break;

      case 'maneuverability.traverseSpeed':
        sorted = filtered.sort(
          (a, b) =>
            a.tracks.at(-1)!.traverseSpeed - b.tracks.at(-1)!.traverseSpeed,
        );
        break;
    }

    return sort.direction === 'ascending' ? sorted : sorted.reverse();
  }, [
    sort,
    ...Object.entries(filters)
      .filter(([name]) => name !== 'page')
      .map(([, value]) => value),
  ]);
  const [searchResults, setSearchedList] = useState(searchableTanks);
  const page = useTankopediaPersistent((state) => state.filters.page);
  const wideFormat = typeof window !== 'undefined' && window.innerWidth > 512;
  const chunkSize = wideFormat ? tanksPerPage / 2 : Infinity;
  const searchResultsPageSlice = searchResults.slice(
    page * tanksPerPage,
    (page + 1) * tanksPerPage,
  );
  const firstChunk = searchResultsPageSlice.slice(0, chunkSize);
  const secondChunk = searchResultsPageSlice.slice(chunkSize);

  useEffect(() => {
    setSearchedList(searchableTanks);
  }, [searchableTanks]);
  useEffect(() => {
    mutateTankopediaPersistent((draft) => {
      draft.filters.page = Math.min(
        Math.max(0, page),
        Math.ceil(searchResults.length / tanksPerPage) - 1,
      );
    });
  }, [searchResults]);

  return (
    <>
      <Flex direction="column" gap="4">
        <Flex gap="2">
          <TextField.Root
            style={{ flex: 1 }}
            ref={input}
            placeholder="Search tanks..."
            onChange={(event) => {
              const results = go(event.target.value, searchableTanks, {
                keys: [
                  'name',
                  'nameFull',
                  'id',
                ] satisfies (keyof TankDefinition)[],
                all: true,
              }).map(({ obj }) => obj);

              setSearchedList(results);
            }}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft" color="gray">
                Sort
                <CaretDownIcon />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Label>By</DropdownMenu.Label>

              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger>Meta</DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'meta.tier'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'meta.tier';
                      });
                    }}
                  >
                    Tier
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'meta.name'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
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
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'fire.dpm';
                      });
                    }}
                  >
                    DPM
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'fire.reload'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'fire.reload';
                      });
                    }}
                  >
                    Reload
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'fire.caliber'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'fire.caliber';
                      });
                    }}
                  >
                    Caliber
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'fire.standardPenetration'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'fire.standardPenetration';
                      });
                    }}
                  >
                    Standard penetration
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'fire.premiumPenetration'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'fire.premiumPenetration';
                      });
                    }}
                  >
                    Premium penetration
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'fire.damage'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'fire.damage';
                      });
                    }}
                  >
                    Damage
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'fire.shellVelocity'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'fire.shellVelocity';
                      });
                    }}
                  >
                    Shell velocity
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'fire.aimTime'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'fire.aimTime';
                      });
                    }}
                  >
                    Aim time
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'fire.dispersionStill'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'fire.dispersionStill';
                      });
                    }}
                  >
                    Dispersion still
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'fire.dispersionMoving'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'fire.dispersionMoving';
                      });
                    }}
                  >
                    Dispersion moving
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'fire.gunDepression'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'fire.gunDepression';
                      });
                    }}
                  >
                    Gun depression
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'fire.gunElevation'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'fire.gunElevation';
                      });
                    }}
                  >
                    Gun elevation
                  </DropdownMenu.CheckboxItem>
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>

              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger>
                  Maneuverability
                </DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'maneuverability.forwardsSpeed'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'maneuverability.forwardsSpeed';
                      });
                    }}
                  >
                    Forwards speed
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'maneuverability.backwardsSpeed'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'maneuverability.backwardsSpeed';
                      });
                    }}
                  >
                    Backwards speed
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'maneuverability.power'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'maneuverability.power';
                      });
                    }}
                  >
                    Power
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'maneuverability.powerToWeight'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'maneuverability.powerToWeight';
                      });
                    }}
                  >
                    Power to weight
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'maneuverability.weight'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'maneuverability.weight';
                      });
                    }}
                  >
                    Weight
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'maneuverability.traverseSpeed'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
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
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'survivability.health';
                      });
                    }}
                  >
                    Health
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'survivability.viewRange'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'survivability.viewRange';
                      });
                    }}
                  >
                    View range
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'survivability.camouflageStill'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'survivability.camouflageStill';
                      });
                    }}
                  >
                    Camouflage
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'survivability.camouflageMoving'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'survivability.camouflageMoving';
                      });
                    }}
                  >
                    Camouflage moving
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'survivability.camouflageShooting'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'survivability.camouflageShooting';
                      });
                    }}
                  >
                    Camouflage shooting
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'survivability.volume'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
                        draft.sort.by = 'survivability.volume';
                      });
                    }}
                  >
                    Volume
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.CheckboxItem
                    checked={sort.by === 'survivability.length'}
                    onClick={() => {
                      mutateTankopediaPersistent((draft) => {
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
                  mutateTankopediaPersistent((draft) => {
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

          <Button
            color="red"
            variant="soft"
            onClick={() =>
              useTankopediaPersistent.setState({
                filters: {
                  nations: [],
                  tiers: [],
                  treeTypes: [],
                  types: [],
                  test: 'include',
                  page: 0,
                },
                sort: {
                  by: 'meta.tier',
                  direction: 'descending',
                },
              })
            }
          >
            <TrashIcon />
          </Button>
        </Flex>

        <Options />
      </Flex>

      <Flex justify="center">
        <Text color="gray">
          Sorting: {SORT_NAMES[sort.by]}, {sort.direction}
        </Text>
      </Flex>

      {!compact && (
        <PageTurner tanksPerPage={tanksPerPage} searchedList={searchResults} />
      )}
      <Flex wrap="wrap" gap="2" justify={compact ? 'between' : 'center'}>
        {!compact &&
          searchResultsPageSlice.map((tank) => (
            <Card
              key={tank.id}
              onClick={() => onSelect(tank)}
              className={styles.listing}
              style={{
                flex: 1,
                cursor: 'pointer',
                height: 64,
                minWidth: 256,
              }}
            >
              <Inset
                key={tank.id}
                style={{
                  minHeight: 64,
                  position: 'relative',
                  display: 'flex',
                }}
              >
                <img
                  className={styles.flag}
                  src={asset(`flags/scratched/${tank.nation}.webp`)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    position: 'absolute',
                  }}
                />

                <div
                  className={styles.listingShadow}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    transition: `box-shadow ${theme.durations.regular}`,
                  }}
                />

                <div
                  style={{
                    width: 256,
                    height: 128,
                  }}
                  className={styles.listingImage}
                >
                  <img
                    src={tankIcon(tank.id)}
                    style={{
                      objectFit: 'contain',
                      objectPosition: 'left center',
                    }}
                  />
                </div>

                <Flex
                  align="center"
                  justify="between"
                  className={styles.listingLabel}
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    padding: '0 12px',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <Flex align="center" justify="center" gap="1">
                    <img
                      src={
                        (tank.treeType === 'collector'
                          ? TANK_ICONS_COLLECTOR
                          : tank.treeType === 'premium'
                            ? TANK_ICONS_PREMIUM
                            : TANK_ICONS)[tank.class]
                      }
                      style={{ width: '1em', height: '1em' }}
                    />
                    <Text
                      size="4"
                      color={
                        tank.treeType === 'collector'
                          ? 'blue'
                          : tank.treeType === 'premium'
                            ? 'amber'
                            : undefined
                      }
                      weight="medium"
                      style={{
                        color:
                          tank.treeType === 'researchable'
                            ? slateDark.slate12
                            : undefined,
                        whiteSpace: 'nowrap',
                        maxWidth: 160,
                        display: 'block',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      }}
                    >
                      {tank.name}
                    </Text>
                  </Flex>

                  <Text size="4" color="gray" highContrast={false}>
                    {TIER_ROMAN_NUMERALS[tank.tier]}
                  </Text>
                </Flex>
              </Inset>
            </Card>
          ))}

        {compact && (
          <CompactSearchResultRow tanks={firstChunk} onSelect={onSelect} />
        )}

        {compact && secondChunk.length > 0 && (
          <CompactSearchResultRow tanks={secondChunk} onSelect={onSelect} />
        )}
      </Flex>
      <PageTurner tanksPerPage={tanksPerPage} searchedList={searchResults} />
    </>
  );
}
