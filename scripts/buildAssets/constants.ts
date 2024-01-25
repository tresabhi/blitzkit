export const DATA =
  'C:/Program Files (x86)/Steam/steamapps/common/World of Tanks Blitz/Data';

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
  equipmentItemImageMappings:
    'UI/Screens3/Lobby/Inventory/Equipment/EquipmentItemImage.style.yaml',
  defaultCamoIcon: 'Gfx/UI/Hangar/IconCamouflage.webp',
} as const;
