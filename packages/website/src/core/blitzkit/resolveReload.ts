import type { GunDefinition } from '@blitzkit/core';

export function resolveReload(gun: GunDefinition) {
  if (gun.gunType!.$case === 'regular') {
    return gun.gunType!.value.regular.reload;
  } else if (gun.gunType!.$case === 'autoLoader') {
    return (
      gun.gunType!.value.autoLoader.clipReload +
      (gun.gunType!.value.autoLoader.shellCount - 1) *
        gun.gunType!.value.autoLoader.intraClip
    );
  } else {
    return (
      gun.gunType!.value.autoReloader.shellReloads.reduce((a, b) => a + b, 0) +
      (gun.gunType!.value.autoReloader.shellCount - 1) *
        gun.gunType!.value.autoReloader.intraClip
    );
  }
}
