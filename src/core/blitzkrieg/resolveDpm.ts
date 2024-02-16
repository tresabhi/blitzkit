import { GunDefinition, ShellDefinition } from './tankDefinitions';

export function resolveDpm(
  gun: GunDefinition,
  shell: ShellDefinition,
  hasRammer = false,
  hasShellReloadBoost = false,
  hasAdrenaline = false,
  hasTungsten = false,
) {
  const alpha = shell.damage.armor * (hasTungsten ? 1.15 : 1);

  if (gun.type === 'regular') {
    return (
      (alpha /
        ((hasRammer ? 0.93 : 1) * (hasAdrenaline ? 0.8 : 1) * gun.reload)) *
      60
    );
  } else if (gun.type === 'autoLoader') {
    return (
      ((alpha * gun.count) /
        (gun.reload +
          (gun.count - 1) * gun.interClip * (hasShellReloadBoost ? 0.7 : 1))) *
      60
    );
  } else {
    return (
      ((alpha * gun.count) /
        (gun.reload.reduce((a, b) => a + b, 0) +
          (gun.count - 1) * gun.interClip)) *
      60
    );
  }
}
