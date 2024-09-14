import { GunDefinition } from '@blitzkit/core';

export function resolveReload(gun: GunDefinition) {
  if (gun.type === 'regular') {
    return gun.reload;
  } else if (gun.type === 'autoLoader') {
    return gun.reload + (gun.count - 1) * gun.intraClip;
  } else {
    return (
      gun.reload.reduce((a, b) => a + b, 0) + (gun.count - 1) * gun.intraClip
    );
  }
}
