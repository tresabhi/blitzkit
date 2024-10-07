import type { GunDefinition } from '@blitzkit/core';

export function resolveReload(gun: GunDefinition) {
  if (gun.gun_type!.$case === 'regular') {
    return gun.gun_type!.value.extension.reload;
  } else if (gun.gun_type!.$case === 'auto_loader') {
    return (
      gun.gun_type!.value.extension.clip_reload +
      (gun.gun_type!.value.extension.shell_count - 1) *
        gun.gun_type!.value.extension.intra_clip
    );
  } else {
    return (
      gun.gun_type!.value.extension.shell_reloads.reduce((a, b) => a + b, 0) +
      (gun.gun_type!.value.extension.shell_count - 1) *
        gun.gun_type!.value.extension.intra_clip
    );
  }
}
