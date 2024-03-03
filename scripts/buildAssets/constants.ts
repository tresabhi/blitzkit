import { argv } from 'process';

const isDepot = argv.includes('--depot');
export const WOTB_WIN32_DEPOT = 444202;
export const DATA = isDepot
  ? // ? await (async () => {
    //     const [installationVersion] = await readdir(`depots/${WOTB_WIN32_DEPOT}`);
    //     return `depots/${WOTB_WIN32_DEPOT}/${installationVersion}/Data`;
    //   })()
    `depots/${WOTB_WIN32_DEPOT}/Data`
  : 'C:/Program Files (x86)/Steam/steamapps/common/World of Tanks Blitz/Data';

export const POI = {
  vehicleDefinitions: 'XML/item_defs/vehicles',
  strings: 'Strings',
  cachedStrings: 'https://stufficons.wgcdn.co/localizations/en.yaml',
  tankParameters: '3d/Tanks/Parameters',
  smallIcons: 'Gfx/UI/BattleScreenHUD/SmallTankIcons',
  bigIcons: 'Gfx/UI/BigTankIcons',
  flags: 'Gfx/Lobby/flags',
  '3d': '3d',
  bigShellIcons: 'Gfx/Shared/tank-supply/ammunition/big',
  moduleIcons: 'Gfx/UI/ModulesTechTree',
  collisionMeshes: '3d/Tanks/CollisionMeshes',
  optionalDevices: 'XML/item_defs/vehicles/common/optional_devices.xml',
  optionalDeviceSlots:
    'XML/item_defs/vehicles/common/optional_device_slots.xml',
  optionalDeviceImageMappings:
    'UI/Screens3/Lobby/Inventory/OptionalDevices/OptionalDevicesItemImage.style.yaml',
  optionalDevicesImage:
    'Gfx/UI/InventoryIcons/Big/OptionalDevices/texture0.packed.webp',
  consumablesCommon: 'XML/item_defs/vehicles/common/consumables/common.xml',
  consumableIcons: 'Gfx/UI/InventoryIcons/Big/Consumables',
  provisionIcons: 'Gfx/UI/InventoryIcons/Big/Provisions',
  equipmentItemImageMappings:
    'UI/Screens3/Lobby/Inventory/Equipment/EquipmentItemImage.style.yaml',
  provisionsCommon: 'XML/item_defs/vehicles/common/provisions/common.xml',
  defaultCamoIcon: 'Gfx/UI/Hangar/IconCamouflage.webp',
  boosterIcons: 'Gfx/Shared/boosters',
} as const;
