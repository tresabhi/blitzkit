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
    const mostOptimalShell = gun.reload.reduce<null | {
      index: number;
      reload: number;
    }>((current, reloadRaw, index) => {
      const reload =
        reloadRaw * reloadCoefficient +
        (index > 0 ? gun.intraClip * intraClipCoefficient : 0);

      if (current === null || reload < current.reload) {
        return { index, reload };
      }
      return current;
    }, null)!;

    dps = alpha / mostOptimalShell?.reload;
  }

  return dps * 60;
}
