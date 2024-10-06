import {
  GunDefinition,
  GunDefinitionAutoReloaderProperties,
  ShellDefinition,
} from '../protos';

export function resolveDpm(
  gun: GunDefinition,
  shell: ShellDefinition,
  damageCoefficient = 1,
  reloadCoefficient = 1,
  intraClipCoefficient = 1,
) {
  const alpha = shell.armorDamage * damageCoefficient;
  let dps: number;

  if (gun.gunType!.$case === 'regular') {
    dps = alpha / (reloadCoefficient * gun.gunType!.value.extension.reload);
  } else if (gun.gunType!.$case === 'autoLoader') {
    dps =
      (alpha * gun.gunType!.value.extension.shellCount) /
      (gun.gunType!.value.extension.clipReload * reloadCoefficient +
        (gun.gunType!.value.extension.shellCount - 1) *
          gun.gunType!.value.extension.intraClip *
          intraClipCoefficient);
  } else {
    const mostOptimalShell =
      gun.gunType!.value.extension.shellReloads.reduce<null | {
        index: number;
        reload: number;
      }>((current, reloadRaw, index) => {
        const reload =
          reloadRaw * reloadCoefficient +
          (index > 0
            ? (
                gun.gunType!.value
                  .extension as GunDefinitionAutoReloaderProperties
              ).intraClip * intraClipCoefficient
            : 0);

        if (current === null || reload < current.reload) {
          return { index, reload };
        }
        return current;
      }, null)!;

    dps = alpha / mostOptimalShell?.reload;
  }

  return dps * 60;
}
