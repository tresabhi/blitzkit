import {
  EquipmentDefinitions,
  ModelDefinition,
  ProvisionDefinitions,
} from '@blitzkit/core';
import { resolveNearPenetration } from '@blitzkit/core/src/blitz/resolveNearPenetration';
import { coefficient } from '@blitzkit/core/src/blitzkit/coefficient';
import { degressiveStat } from '@blitzkit/core/src/blitzkit/degressiveStat';
import { isExplosive } from '@blitzkit/core/src/blitzkit/isExplosive';
import { normalizeBoundingBox } from '@blitzkit/core/src/blitzkit/normalizeBoundingBox';
import { progressiveStat } from '@blitzkit/core/src/blitzkit/progressiveStat';
import { resolveDpm } from '@blitzkit/core/src/blitzkit/resolveDpm';
import { resolvePenetrationCoefficient } from '@blitzkit/core/src/blitzkit/resolvePenetrationCoefficient';
import { sum } from '@blitzkit/core/src/blitzkit/sum';
import {
  EngineDefinition,
  GunDefinition,
  ShellDefinition,
  TankDefinition,
  TrackDefinition,
  TurretDefinition,
} from '@blitzkit/core/src/blitzkit/tankDefinitions';
import { unionBoundingBox } from '@blitzkit/core/src/blitzkit/unionBoundingBox';
import { EquipmentMatrix } from '../../stores/duel';

export type TankCharacteristics = ReturnType<typeof tankCharacteristics>;

export function tankCharacteristics(
  {
    tank,
    turret,
    gun,
    shell,
    consumables,
    equipmentMatrix,
    crewMastery,
    provisions,
    engine,
    crewSkills,
    camouflage,
    track,
    stockEngine,
    stockTrack,
    stockTurret,
    stockGun,
    applyReactiveArmor,
    applyDynamicArmor,
    applySpallLiner,
  }: {
    tank: TankDefinition;
    turret: TurretDefinition;
    gun: GunDefinition;
    shell: ShellDefinition;
    track: TrackDefinition;
    engine: EngineDefinition;
    stockEngine: EngineDefinition;
    stockTrack: TrackDefinition;
    stockTurret: TurretDefinition;
    stockGun: GunDefinition;
    consumables: number[];
    equipmentMatrix: EquipmentMatrix;
    crewMastery: number;
    provisions: number[];
    crewSkills: Record<string, number>;
    camouflage: boolean;
    applyReactiveArmor: boolean;
    applyDynamicArmor: boolean;
    applySpallLiner: boolean;
  },
  {
    tankModelDefinition,
    equipmentDefinitions,
    provisionDefinitions,
  }: {
    tankModelDefinition: ModelDefinition;
    equipmentDefinitions: EquipmentDefinitions;
    provisionDefinitions: ProvisionDefinitions;
  },
) {
  const presetRows = equipmentDefinitions.presets[tank.equipment];
  const turretModelDefinition = tankModelDefinition.turrets[turret.id];
  const gunModelDefinition = turretModelDefinition.guns[gun.id];

  function equipment(id: number) {
    return presetRows.some((equipmentRow, rowIndex) => {
      return equipmentRow.some((equipment, columnIndex) => {
        const choice = equipmentMatrix[rowIndex][columnIndex];
        if (choice === 0) return false;
        const equipped = equipment[choice === -1 ? 0 : 1];
        return equipped === id;
      });
    });
  }
  function consumable(id: number) {
    return consumables.includes(id);
  }
  function provision(id: number) {
    return provisions.includes(id);
  }

  const hasGunRammer = equipment(100);
  const hasImprovedVentilation = equipment(102);
  const hasCalibratedShells = equipment(103);
  const hasEnhancedGunLayingDrive = equipment(104);
  const hasSupercharger = equipment(107);
  const hasVerticalStabilizer = equipment(105);
  const hasRefinedGun = equipment(106);
  const hasImprovedAssembly = equipment(111);
  const hasImprovedOptics = equipment(114);
  const hasImprovedControl = equipment(116);
  const hasEngineAccelerator = equipment(117);
  const hasCamouflageNet = equipment(115);
  const hasImprovedVerticalStabilizer = equipment(122);
  const hasImprovedSuspension = equipment(123);

  const hasTungsten = consumable(45);
  const hasAdrenaline = consumable(18);
  const hasShellReloadBoost = consumable(29);
  const hasEnginePowerBoost = consumable(14);
  const hasImprovedEnginePowerBoost = consumable(27);
  const hasReticleCalibration = consumable(28);
  const hasReducedEnginePowerBoost = consumable(80);

  const hasStandardFuel = provision(18);
  const hasImprovedFuel = provision(19);
  const hasProtectiveKit = provision(22);
  const hasSandbagArmor = provision(28);
  const hasEnhancedSandbagArmor = provision(29);
  const hasImprovedGunPowder = provision(46);
  const hasGearOil = provision(44);
  const hasImprovedGearOil = provision(45);

  const gunDefaultPitch = tankModelDefinition.turretRotation?.pitch ?? 0;
  const provisionCrewBonus =
    provisions.reduce(
      (total, provision) =>
        provisionDefinitions[provision].crew
          ? total + provisionDefinitions[provision].crew! / 100
          : total,
      0,
    ) + (hasImprovedVentilation ? 0.08 : 0);
  const commanderMastery = crewMastery + provisionCrewBonus;
  const loaderMastery =
    commanderMastery *
    (tank.crew.some(({ type }) => type === 'loader') ? 1.1 : 1.05);
  const gunnerMastery =
    commanderMastery *
    (tank.crew.some(({ type }) => type === 'gunner') ? 1.1 : 1.05);
  const driverMastery =
    commanderMastery *
    (tank.crew.some(({ type }) => type === 'driver') ? 1.1 : 1.05);
  const intraClipCoefficient = coefficient([hasShellReloadBoost, -0.3]);
  const damageCoefficient =
    coefficient([hasTungsten, 0.15]) *
    coefficient(
      [applyReactiveArmor, -0.27],
      [applyDynamicArmor, -0.1],
      [applySpallLiner && shell.type === 'he', -0.2],
    );
  const reloadCoefficient =
    (coefficient([hasGunRammer, -0.05]) *
      coefficient([true, degressiveStat(loaderMastery)])) /
    coefficient([hasAdrenaline && gun.type === 'regular', 0.17]);
  const penetrationCoefficient = coefficient([
    hasCalibratedShells,
    resolvePenetrationCoefficient(true, shell.type) - 1,
  ]);
  const healthCoefficient = coefficient(
    [hasSandbagArmor, 0.03],
    [hasEnhancedSandbagArmor, 0.06],
    [hasImprovedAssembly, 0.04],
  );
  const shellVelocityCoefficient = coefficient(
    [hasSupercharger, 0.35],
    [hasImprovedGunPowder, 0.3],
  );
  const penetrationLossOverDistanceCoefficient = coefficient([
    hasSupercharger,
    -0.6,
  ]);
  const aimTimeCoefficient =
    coefficient(
      [hasEnhancedGunLayingDrive, -0.15],
      [hasReticleCalibration, -0.3],
    ) * coefficient([true, degressiveStat(gunnerMastery)]);
  const dispersionStillCoefficient =
    coefficient([hasRefinedGun, -0.15], [hasReticleCalibration, -0.3]) *
    coefficient([true, degressiveStat(gunnerMastery)]);
  const dispersionDamagedCoefficient = coefficient([
    hasVerticalStabilizer,
    -0.12,
  ]);
  const dispersionHullTraverseCoefficient = coefficient(
    [hasVerticalStabilizer, -0.15],
    [true, -crewSkills.smooth_turn / 100],
  );
  const dispersionAfterShotCoefficient = coefficient(
    [hasVerticalStabilizer, -0.15],
    [true, -crewSkills.soft_recoil / 100],
  );
  const dispersionMovingCoefficient = coefficient(
    [hasVerticalStabilizer, -0.15],
    [true, -crewSkills.smooth_driving / 100],
  );
  const dispersionTurretTraverseCoefficient = coefficient(
    [hasVerticalStabilizer, -0.15],
    [true, -crewSkills.smooth_turret * (2 / 100)],
  );
  const enginePowerCoefficient = coefficient(
    [
      hasEngineAccelerator,
      tank.class === 'heavyTank' || tank.class === 'AT-SPG' ? 0.05 : 0.04,
    ],
    [hasReducedEnginePowerBoost, 0.1],
    [hasEnginePowerBoost, 0.2],
    [hasImprovedEnginePowerBoost, 0.35],
    [hasStandardFuel, 0.03],
    [hasImprovedFuel, 0.1],
    [hasGearOil, 0.03],
    [hasImprovedGearOil, 0.06],
  );
  const turretTraverseCoefficient =
    coefficient([hasStandardFuel, 0.03], [hasImprovedFuel, 0.1]) *
    coefficient([true, progressiveStat(gunnerMastery)]);
  const hullTraverseCoefficient =
    coefficient(
      [hasImprovedControl, 0.11],
      [hasImprovedEnginePowerBoost, 0.01],
      [true, crewSkills.virtuoso / 100],
    ) * coefficient([true, progressiveStat(driverMastery)]);
  const resistanceHardCoefficient = coefficient([hasImprovedSuspension, -0.2]);
  const resistanceMediumCoefficient = coefficient([
    hasImprovedSuspension,
    -0.15,
  ]);
  const resistanceSoftCoefficient = coefficient([hasImprovedSuspension, -0.3]);
  const viewRangeCoefficient =
    coefficient([
      hasImprovedOptics,
      tank.class === 'heavyTank'
        ? 0.06
        : tank.class === 'mediumTank'
          ? 0.08
          : tank.class === 'lightTank'
            ? 0.11
            : 0.04,
    ]) * coefficient([true, progressiveStat(commanderMastery)]);
  const fireChanceCoefficient = coefficient([hasProtectiveKit, -0.2]);

  const speedForwardsSum = sum(
    [hasImprovedEnginePowerBoost, 4],
    [hasGearOil, 2],
    [hasImprovedGearOil, 4],
  );
  const speedBackwardsSum = sum(
    [hasImprovedEnginePowerBoost, 8],
    [hasGearOil, 2],
    [hasImprovedGearOil, 4],
  );
  const camouflageCoefficientMoving = sum(
    [
      true,
      coefficient([
        camouflage,
        tank.class === 'AT-SPG'
          ? 0.04
          : tank.class === 'heavyTank'
            ? 0.03
            : 0.02,
      ]),
    ],
    [
      hasCamouflageNet,
      tank.class === 'heavyTank'
        ? 0.02
        : tank.class === 'mediumTank'
          ? 0.04
          : tank.class === 'lightTank'
            ? 0.07
            : 0.1,
    ],
  );
  const camouflageCoefficientStill = sum(
    [
      true,
      coefficient(
        [
          camouflage,
          tank.class === 'AT-SPG'
            ? 0.04
            : tank.class === 'heavyTank'
              ? 0.03
              : 0.02,
        ],
        [true, crewSkills.camouflage * (3 / 100)],
      ),
    ],
    [
      hasCamouflageNet,
      tank.class === 'heavyTank'
        ? 0.04
        : tank.class === 'mediumTank'
          ? 0.08
          : tank.class === 'lightTank'
            ? 0.14
            : 0.2,
    ],
  );

  const size = normalizeBoundingBox(
    unionBoundingBox(
      tankModelDefinition.boundingBox,
      turretModelDefinition.boundingBox,
    ),
  );
  const weightKg =
    tank.weight + engine.weight + track.weight + turret.weight + gun.weight;
  const weightTons = weightKg / 1000;
  const stockWeight =
    tank.weight +
    stockEngine.weight +
    stockTrack.weight +
    stockTurret.weight +
    stockGun.weight;
  const resolvedEnginePower = engine.power * enginePowerCoefficient;
  const dpm = resolveDpm(
    gun,
    shell,
    damageCoefficient,
    reloadCoefficient,
    intraClipCoefficient,
  );
  const intraClip =
    gun.type === 'regular' ? undefined : gun.intraClip * intraClipCoefficient;
  const mostOptimalShellIndex =
    gun.type === 'autoReloader'
      ? gun.reload.reduce<null | { index: number; reload: number }>(
          (current, reloadRaw, index) => {
            const reload =
              reloadRaw * reloadCoefficient + (index > 0 ? intraClip! : 0);

            if (current === null || reload < current.reload) {
              return { index, reload };
            }
            return current;
          },
          null,
        )!.index
      : undefined;
  const damage = shell.damage.armor * damageCoefficient;
  const dpmEffective =
    gun.type === 'autoReloader'
      ? gun.reload[0] > gun.reload[1] + gun.intraClip
        ? ((damageCoefficient * shell.damage.armor) /
            (gun.reload.at(-1)! * reloadCoefficient +
              gun.intraClip * intraClipCoefficient)) *
            (60 -
              (gun.reload.slice(0, -1).length - 1) *
                gun.intraClip *
                intraClipCoefficient) +
          damageCoefficient *
            shell.damage.armor *
            gun.reload.slice(0, -1).length
        : ((damageCoefficient * shell.damage.armor) /
            (gun.reload[0] * reloadCoefficient +
              gun.intraClip * intraClipCoefficient)) *
            (60 -
              (gun.reload.slice(1).length - 1) *
                gun.intraClip *
                intraClipCoefficient) +
          damageCoefficient * shell.damage.armor * gun.reload.slice(1).length
      : undefined;
  const shells = gun.type === 'regular' ? 1 : gun.count;
  const shellReloads =
    gun.type === 'autoReloader'
      ? gun.reload.map((reload) => reload * reloadCoefficient)
      : undefined;
  const shellReload =
    gun.type === 'autoReloader' ? undefined : gun.reload * reloadCoefficient;
  const caliber = shell.caliber;
  const penetration =
    resolveNearPenetration(shell.penetration) * penetrationCoefficient;
  const clipDamage = gun.type === 'regular' ? undefined : gun.count * damage;
  const moduleDamage = shell.damage.module * damageCoefficient;
  const explosionRadius = shell.explosionRadius;
  const shellVelocity = shell.speed * shellVelocityCoefficient;
  const aimTime = gun.aimTime * aimTimeCoefficient;
  const dispersion = gun.dispersion.base * dispersionStillCoefficient;
  const maxDispersion =
    gun.dispersion.base *
    Math.sqrt(
      ((gun.dispersion.traverse * turret.traverseSpeed) ** 2 +
        (track.dispersion.traverse * track.traverseSpeed) ** 2 +
        track.dispersion.move * tank.speed.forwards) **
        2,
    );
  const dispersionMoving = track.dispersion.move * dispersionMovingCoefficient;
  const dispersionHullTraversing =
    track.dispersion.traverse * dispersionHullTraverseCoefficient;
  const dispersionTurretTraversing =
    gun.dispersion.traverse * dispersionTurretTraverseCoefficient;
  const dispersionShooting =
    gun.dispersion.shot * dispersionAfterShotCoefficient;
  const dispersionGunDamaged =
    gun.dispersion.damaged * dispersionDamagedCoefficient;
  const gunDepression =
    gunModelDefinition.pitch.max +
    gunDefaultPitch +
    (hasImprovedVerticalStabilizer ? 3 : 0);
  const gunElevation =
    -gunModelDefinition.pitch.min -
    gunDefaultPitch +
    (hasImprovedVerticalStabilizer ? 4 : 0);
  const gunFrontalDepression = gunModelDefinition.pitch.front?.max;
  const gunFrontalElevation = gunModelDefinition.pitch.front
    ? -gunModelDefinition.pitch.front.min
    : undefined;
  const gunRearDepression = gunModelDefinition.pitch.back?.max;
  const gunRearElevation = gunModelDefinition.pitch.back
    ? -gunModelDefinition.pitch.back.min
    : undefined;
  const azimuthLeft = turretModelDefinition.yaw
    ? -turretModelDefinition.yaw.min
    : undefined;
  const azimuthRight = turretModelDefinition.yaw?.max;
  const speedForwards = tank.speed.forwards + speedForwardsSum;
  const speedBackwards = tank.speed.backwards + speedBackwardsSum;
  const enginePower = resolvedEnginePower;
  const hardTerrainCoefficientRaw =
    track.resistance.hard * resistanceHardCoefficient;
  const hardTerrainCoefficient = 100 / hardTerrainCoefficientRaw;
  const mediumTerrainCoefficientRaw =
    track.resistance.medium * resistanceMediumCoefficient;
  const mediumTerrainCoefficient = 100 / mediumTerrainCoefficientRaw;
  const softTerrainCoefficientRaw =
    track.resistance.soft * resistanceSoftCoefficient;
  const softTerrainCoefficient = 100 / softTerrainCoefficientRaw;
  const powerToWeightRatioHardTerrain =
    resolvedEnginePower / weightTons / hardTerrainCoefficientRaw;
  const powerToWeightRatioMediumTerrain =
    resolvedEnginePower / weightTons / mediumTerrainCoefficientRaw;
  const powerToWeightRatioSoftTerrain =
    resolvedEnginePower / weightTons / softTerrainCoefficientRaw;
  const weight = weightTons;
  const turretTraverseSpeed = turret.traverseSpeed * turretTraverseCoefficient;
  const hullTraverseHardTerrain =
    (resolvedEnginePower / stockEngine.power) *
    track.traverseSpeed *
    hullTraverseCoefficient *
    (track.resistance.hard / hardTerrainCoefficientRaw) *
    (stockWeight / weightKg);
  const hullTraverseMediumTerrain =
    (resolvedEnginePower / stockEngine.power) *
    track.traverseSpeed *
    hullTraverseCoefficient *
    (track.resistance.hard / mediumTerrainCoefficientRaw) *
    (stockWeight / weightKg);
  const hullTraverseSoftTerrain =
    (resolvedEnginePower / stockEngine.power) *
    track.traverseSpeed *
    hullTraverseCoefficient *
    (track.resistance.hard / softTerrainCoefficientRaw) *
    (stockWeight / weightKg);
  const health = (tank.health + turret.health) * healthCoefficient;
  const fireChance = engine.fireChance * fireChanceCoefficient;
  const viewRange = turret.viewRange * viewRangeCoefficient;
  const camouflageStill = tank.camouflage.still * camouflageCoefficientStill;
  const camouflageMoving =
    tank.class === 'lightTank'
      ? tank.camouflage.still * camouflageCoefficientStill
      : tank.camouflage.moving * camouflageCoefficientMoving;
  const camouflageShootingStill =
    tank.camouflage.still * gun.camouflageLoss * camouflageCoefficientStill;
  const camouflageShootingMoving =
    (tank.class === 'lightTank'
      ? tank.camouflage.still * camouflageCoefficientStill
      : tank.camouflage.moving * camouflageCoefficientMoving) *
    gun.camouflageLoss;
  const camouflageCaughtOnFire =
    tank.camouflage.onFire * tank.camouflage.still * camouflageCoefficientStill;
  const width = size[2];
  const height = size[0];
  const length = size[1];
  const volume = width * height * length;
  const shellNormalization = shell.normalization ?? 0;
  const shellRicochet = isExplosive(shell.type) ? undefined : shell.ricochet;

  return {
    shellNormalization,
    shellRicochet,
    dpm,
    dpmEffective,
    shells,
    mostOptimalShellIndex,
    shellReloads,
    shellReload,
    intraClip,
    caliber,
    penetration,
    damage,
    clipDamage,
    moduleDamage,
    explosionRadius,
    shellVelocity,
    aimTime,
    dispersion,
    maxDispersion,
    dispersionMoving,
    dispersionHullTraversing,
    dispersionTurretTraversing,
    dispersionShooting,
    dispersionGunDamaged,
    gunDepression,
    gunElevation,
    gunFrontalDepression,
    gunFrontalElevation,
    gunRearDepression,
    gunRearElevation,
    azimuthLeft,
    azimuthRight,
    speedForwards,
    speedBackwards,
    hardTerrainCoefficient,
    hardTerrainCoefficientRaw,
    mediumTerrainCoefficient,
    mediumTerrainCoefficientRaw,
    softTerrainCoefficient,
    softTerrainCoefficientRaw,
    enginePower,
    powerToWeightRatioHardTerrain,
    powerToWeightRatioMediumTerrain,
    powerToWeightRatioSoftTerrain,
    weight,
    turretTraverseSpeed,
    hullTraverseHardTerrain,
    hullTraverseMediumTerrain,
    hullTraverseSoftTerrain,
    health,
    fireChance,
    viewRange,
    camouflageStill,
    camouflageMoving,
    camouflageShootingStill,
    camouflageShootingMoving,
    camouflageCaughtOnFire,
    width,
    height,
    length,
    volume,
  };
}
