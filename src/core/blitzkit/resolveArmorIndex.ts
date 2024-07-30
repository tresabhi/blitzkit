const pattern = /\d+$/;

export function resolveArmorIndex(name: string) {
  const match = name.match(pattern)?.[0];
  return match ? parseInt(match) : undefined;
}
