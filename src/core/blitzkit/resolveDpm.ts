import { GunDefinition, ShellDefinition } from './tankDefinitions';

export function resolveDpm(
  gun: GunDefinition,
  shell: ShellDefinition,
  damageCoefficient = 1,
  reloadCoefficient = 1,
  intraClipCoefficient = 1,
) {
  const alpha = shell.damage.armor * damageCoefficient;
  let dps: number;

  if (gun.type === 'regular') {
    dps = alpha / (reloadCoefficient * gun.reload);
  } else if (gun.type === 'autoLoader') {
    dps =
      (alpha * gun.count) /
      (gun.reload * reloadCoefficient +
        (gun.count - 1) * gun.intraClip * intraClipCoefficient);
  } else {
    if (gun.reload[0] < gun.reload[1] + gun.intraClip) {
      // first shell's the best
      dps = alpha / (gun.reload[0] * reloadCoefficient);
    } else {
      dps =
        alpha /
        (gun.reload.at(-1)! * reloadCoefficient +
          gun.intraClip * intraClipCoefficient);
    }
  }

  return dps * 60;
}
