import type { GunDefinition } from '@blitzkit/core';

export function resolveReload(gun: GunDefinition) {
  if (gun.gunType!.$case === 'regular') {
    return gun.gunType!.value.extension.reload;
  } else if (gun.gunType!.$case === 'autoLoader') {
    return (
      gun.gunType!.value.extension.clipReload +
      (gun.gunType!.value.extension.shellCount - 1) *
        gun.gunType!.value.extension.intraClip
    );
  } else {
    return (
      gun.gunType!.value.extension.shellReloads.reduce((a, b) => a + b, 0) +
      (gun.gunType!.value.extension.shellCount - 1) *
        gun.gunType!.value.extension.intraClip
    );
  }
}
