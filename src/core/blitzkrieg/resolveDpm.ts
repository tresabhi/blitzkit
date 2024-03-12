import { GunDefinition, ShellDefinition } from './tankDefinitions';

export function resolveDpm(
  gun: GunDefinition,
  shell: ShellDefinition,
  damageCoefficient = 1,
  reloadCoefficient = 1,
  intraClipCoefficient = 1,
) {
  const alpha = shell.damage.armor * damageCoefficient;

  if (gun.type === 'regular') {
    return (alpha / (reloadCoefficient * gun.reload)) * 60;
  } else if (gun.type === 'autoLoader') {
    return (
      ((alpha * gun.count) /
        (gun.reload + (gun.count - 1) * gun.intraClip * intraClipCoefficient)) *
      60
    );
  } else {
    return (
      ((alpha * gun.count) /
        (gun.reload.reduce((a, b) => a + b, 0) +
          (gun.count - 1) * gun.intraClip)) *
      60
    );
  }
}
