import { GunDefinition, ShellDefinition } from './tankDefinitions';

export function resolveDpm(
  gun: GunDefinition,
  shell: ShellDefinition,
  hasRammer = false,
) {
  if (gun.type === 'regular') {
    return (shell.damage.armor / ((hasRammer ? 0.93 : 1) * gun.reload)) * 60;
  } else if (gun.type === 'autoLoader') {
    return (
      ((shell.damage.armor * gun.count) /
        (gun.reload + (gun.count - 1) * gun.interClip)) *
      60
    );
  } else {
    return (
      ((shell.damage.armor * gun.count) /
        (gun.reload.reduce((a, b) => a + b, 0) +
          (gun.count - 1) * gun.interClip)) *
      60
    );
  }
}
