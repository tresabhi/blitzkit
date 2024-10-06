import {
  CrewType,
  degressiveStat,
  isExplosive,
  normalizeBoundingBox,
  progressiveStat,
  resolveDpm,
  resolvePenetrationCoefficient,
  ShellType,
  sum,
  TankClass,
  unionBoundingBox,
  type EngineDefinition,
  type EquipmentDefinitions,
  type GunDefinition,
  type ModelDefinition,
  type ProvisionDefinitions,
  type ShellDefinition,
  type TankDefinition,
  type TrackDefinition,
  type TurretDefinition,
} from '@blitzkit/core';
import { coefficient } from '@blitzkit/core/src/blitzkit/coefficient';
import type { EquipmentMatrix } from '../../stores/duel';

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
  const preset = equipmentDefinitions.presets[tank.equipmentPreset];
  const turretModelDefinition = tankModelDefinition.turrets[turret.id];
  const gunModelDefinition =
    turretModelDefinition.guns[gun.gunType!.value.base.id];

  function equipment(id: number) {
    return preset.slots.some((slot, index) => {
      const choice = equipmentMatrix[Math.floor(index / 3)][index % 3];
      if (choice === 0) return false;
      const equipped = slot[choice === -1 ? 'left' : 'right'];
      return equipped === id;
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

  const gunDefaultPitch = tankModelDefinition.initialTurretRotation?.pitch ?? 0;
  const provisionCrewBonus =
    provisions.reduce(
      (total, provision) =>
        provisionDefinitions.provisions[provision].crew
          ? total + provisionDefinitions.provisions[provision].crew! / 100
          : total,
      0,
    ) + (hasImprovedVentilation ? 0.08 : 0);
  const commanderMastery = crewMastery + provisionCrewBonus;
  const loaderMastery =
    commanderMastery *
    (tank.crew.some(({ type }) => type === CrewType.LOADER) ? 1.1 : 1.05);
  const gunnerMastery =
    commanderMastery *
    (tank.crew.some(({ type }) => type === CrewType.GUNNER) ? 1.1 : 1.05);
  const driverMastery =
    commanderMastery *
    (tank.crew.some(({ type }) => type === CrewType.DRIVER) ? 1.1 : 1.05);
  const intraClipCoefficient = coefficient([hasShellReloadBoost, -0.3]);
  const damageCoefficient =
    coefficient([hasTungsten, 0.15]) *
    coefficient(
      [applyReactiveArmor, -0.27],
      [applyDynamicArmor, -0.1],
      [applySpallLiner && shell.type === ShellType.HE, -0.2],
    );
  const reloadCoefficient =
    (coefficient([hasGunRammer, -0.05]) *
      coefficient([true, degressiveStat(loaderMastery)])) /
    coefficient([hasAdrenaline && gun.gunType!.$case === 'regular', 0.17]);
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
      tank.class === TankClass.HEAVY || tank.class === TankClass.TANK_DESTROYER
        ? 0.05
        : 0.04,
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
      tank.class === TankClass.HEAVY
        ? 0.06
        : tank.class === TankClass.MEDIUM
          ? 0.08
          : tank.class === TankClass.LIGHT
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
        tank.class === TankClass.TANK_DESTROYER
          ? 0.04
          : tank.class === TankClass.HEAVY
            ? 0.03
            : 0.02,
      ]),
    ],
    [
      hasCamouflageNet,
      tank.class === TankClass.HEAVY
        ? 0.02
        : tank.class === TankClass.MEDIUM
          ? 0.04
          : tank.class === TankClass.LIGHT
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
          tank.class === TankClass.TANK_DESTROYER
            ? 0.04
            : tank.class === TankClass.HEAVY
              ? 0.03
              : 0.02,
        ],
        [true, crewSkills.camouflage * (3 / 100)],
      ),
    ],
    [
      hasCamouflageNet,
      tank.class === TankClass.HEAVY
        ? 0.04
        : tank.class === TankClass.MEDIUM
          ? 0.08
          : tank.class === TankClass.LIGHT
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
    tank.weight +
    engine.weight +
    track.weight +
    turret.weight +
    gun.gunType!.value.base.weight;
  const weightTons = weightKg / 1000;
  const stockWeight =
    tank.weight +
    stockEngine.weight +
    stockTrack.weight +
    stockTurret.weight +
    stockGun.gunType!.value.base.weight;
  const resolvedEnginePower = engine.power * enginePowerCoefficient;
  const dpm = resolveDpm(
    gun,
    shell,
    damageCoefficient,
    reloadCoefficient,
    intraClipCoefficient,
  );
  const intraClip =
    gun.gunType?.$case === 'regular'
      ? undefined
      : gun.gunType!.value.extension.intraClip * intraClipCoefficient;
  const mostOptimalShellIndex =
    gun.gunType!.$case === 'autoReloader'
      ? gun.gunType!.value.extension.shellReloads.reduce<null | {
          index: number;
          reload: number;
        }>((current, reloadRaw, index) => {
          const reload =
            reloadRaw * reloadCoefficient + (index > 0 ? intraClip! : 0);

          if (current === null || reload < current.reload) {
            return { index, reload };
          }
          return current;
        }, null)!.index
      : undefined;
  const damage = shell.armorDamage * damageCoefficient;
  const dpmEffective =
    gun.gunType!.$case === 'autoReloader'
      ? gun.gunType!.value.extension.shellReloads[0] >
        gun.gunType!.value.extension.shellReloads[1] +
          gun.gunType!.value.extension.intraClip
        ? ((damageCoefficient * shell.armorDamage) /
            (gun.gunType!.value.extension.shellReloads.at(-1)! *
              reloadCoefficient +
              gun.gunType!.value.extension.intraClip * intraClipCoefficient)) *
            (60 -
              (gun.gunType!.value.extension.shellReloads.slice(0, -1).length -
                1) *
                gun.gunType!.value.extension.intraClip *
                intraClipCoefficient) +
          damageCoefficient *
            shell.armorDamage *
            gun.gunType!.value.extension.shellReloads.slice(0, -1).length
        : ((damageCoefficient * shell.armorDamage) /
            (gun.gunType!.value.extension.shellReloads[0] * reloadCoefficient +
              gun.gunType!.value.extension.intraClip * intraClipCoefficient)) *
            (60 -
              (gun.gunType!.value.extension.shellReloads.slice(1).length - 1) *
                gun.gunType!.value.extension.intraClip *
                intraClipCoefficient) +
          damageCoefficient *
            shell.armorDamage *
            gun.gunType!.value.extension.shellReloads.slice(1).length
      : undefined;
  const shells =
    gun.gunType!.$case === 'regular'
      ? 1
      : gun.gunType!.value.extension.shellCount;
  const shellReloads =
    gun.gunType!.$case === 'autoReloader'
      ? gun.gunType!.value.extension.shellReloads.map(
          (reload) => reload * reloadCoefficient,
        )
      : undefined;
  const shellReload =
    gun.gunType!.$case === 'autoReloader'
      ? undefined
      : (gun.gunType!.$case === 'regular'
          ? gun.gunType!.value.extension.reload
          : gun.gunType!.value.extension.clipReload) * reloadCoefficient;
  const caliber = shell.caliber;
  const penetration = shell.penetration.near * penetrationCoefficient;
  const clipDamage =
    gun.gunType!.$case === 'regular'
      ? undefined
      : gun.gunType!.value.extension.shellCount * damage;
  const moduleDamage = shell.moduleDamage * damageCoefficient;
  const explosionRadius = shell.explosionRadius;
  const shellVelocity = shell.velocity * shellVelocityCoefficient;
  const aimTime = gun.gunType!.value.base.aimTime * aimTimeCoefficient;
  const dispersion =
    gun.gunType!.value.base.dispersionBase * dispersionStillCoefficient;
  const maxDispersion =
    gun.gunType!.value.base.dispersionBase *
    Math.sqrt(
      ((gun.gunType!.value.base.dispersionTraverse * turret.traverseSpeed) **
        2 +
        (track.traverseSpeed * track.traverseSpeed) ** 2 +
        track.dispersionMove * tank.speedForwards) **
        2,
    );
  const dispersionMoving = track.dispersionMove * dispersionMovingCoefficient;
  const dispersionHullTraversing =
    track.traverseSpeed * dispersionHullTraverseCoefficient;
  const dispersionTurretTraversing =
    gun.gunType!.value.base.dispersionTraverse *
    dispersionTurretTraverseCoefficient;
  const dispersionShooting =
    gun.gunType!.value.base.dispersionShot * dispersionAfterShotCoefficient;
  const dispersionGunDamaged =
    gun.gunType!.value.base.dispersionDamaged * dispersionDamagedCoefficient;
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
  const speedForwards = tank.speedForwards + speedForwardsSum;
  const speedBackwards = tank.speedBackwards + speedBackwardsSum;
  const enginePower = resolvedEnginePower;
  const hardTerrainCoefficientRaw =
    track.resistanceHard * resistanceHardCoefficient;
  const hardTerrainCoefficient = 100 / hardTerrainCoefficientRaw;
  const mediumTerrainCoefficientRaw =
    track.resistanceMedium * resistanceMediumCoefficient;
  const mediumTerrainCoefficient = 100 / mediumTerrainCoefficientRaw;
  const softTerrainCoefficientRaw =
    track.resistanceSoft * resistanceSoftCoefficient;
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
    (track.resistanceHard / hardTerrainCoefficientRaw) *
    (stockWeight / weightKg);
  const hullTraverseMediumTerrain =
    (resolvedEnginePower / stockEngine.power) *
    track.traverseSpeed *
    hullTraverseCoefficient *
    (track.resistanceHard / mediumTerrainCoefficientRaw) *
    (stockWeight / weightKg);
  const hullTraverseSoftTerrain =
    (resolvedEnginePower / stockEngine.power) *
    track.traverseSpeed *
    hullTraverseCoefficient *
    (track.resistanceHard / softTerrainCoefficientRaw) *
    (stockWeight / weightKg);
  const health = (tank.health + turret.health) * healthCoefficient;
  const fireChance = engine.fireChance * fireChanceCoefficient;
  const viewRange = turret.viewRange * viewRangeCoefficient;
  const camouflageStill = tank.camouflageStill * camouflageCoefficientStill;
  const camouflageMoving =
    tank.class === TankClass.LIGHT
      ? tank.camouflageStill * camouflageCoefficientStill
      : tank.camouflageMoving * camouflageCoefficientMoving;
  const camouflageShootingStill =
    tank.camouflageStill *
    gun.gunType!.value.base.camouflageLoss *
    camouflageCoefficientStill;
  const camouflageShootingMoving =
    (tank.class === TankClass.LIGHT
      ? tank.camouflageStill * camouflageCoefficientStill
      : tank.camouflageMoving * camouflageCoefficientMoving) *
    gun.gunType!.value.base.camouflageLoss;
  const camouflageCaughtOnFire =
    tank.camouflageOnFire * tank.camouflageStill * camouflageCoefficientStill;
  const width = size.z;
  const height = size.x;
  const length = size.y;
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
