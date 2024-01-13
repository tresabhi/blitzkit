export function nameToArmorId(name: string) {
  const match = name.match(/.+_armor_(\d+)/);
  const group1 = match![1];

  return parseInt(group1);
}
