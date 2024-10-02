import { GunDefinition } from '../protos';

export function resolveGun(gun: GunDefinition) {
  if (gun.regular) return gun.regular;
  else if (gun.autoLoader) return gun.autoLoader;
  else if (gun.autoReloader) return gun.autoReloader;

  throw new Error('Could not resolve gun');
}
