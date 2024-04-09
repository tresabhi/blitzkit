import { EquipmentMatrix } from '../../stores/duel';
import { isExplosive } from '../blitz/isExplosive';
import { resolveNearPenetration } from '../blitz/resolveNearPenetration';
import { coefficient } from './coefficient';
import { degressiveStat } from './degressiveStat';
import { EquipmentDefinitions } from './equipmentDefinitions';
import { ModelDefinitions } from './modelDefinitions';
import { normalizeBoundingBox } from './normalizeBoundingBox';
import { progressiveStat } from './progressiveStat';
import { ProvisionDefinitions } from './provisionDefinitions';
import { resolveDpm } from './resolveDpm';
import { sum } from './sum';
import {
  EngineDefinition,
  GunDefinition,
  ShellDefinition,
  TankDefinition,
  TrackDefinition,
  TurretDefinition,
} from './tankDefinitions';
import { unionBoundingBox } from './unionBoundingBox';

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
    applyReactive,
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
    applyReactive: boolean;
  },
  {
    modelDefinitions,
    equipmentDefinitions,
    provisionDefinitions,
  }: {
    modelDefinitions: ModelDefinitions;
    equipmentDefinitions: EquipmentDefinitions;
    provisionDefinitions: ProvisionDefinitions;
  },
) {
  const presetRows = equipmentDefinitions.presets[tank.equipment];
  const tankModelDefinition = modelDefinitions[tank.id];
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

  const hasRammer = equipment(100);
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
    ) + (hasImprovedVentilation ? 0.05 : 0);
  const commanderMastery = crewMastery + provisionCrewBonus;
  const crewMemberMastery = commanderMastery * 1.1;

  const intraClipCoefficient = coefficient([hasShellReloadBoost, -0.3]);
  const damageCoefficient =
    coefficient([hasTungsten, 0.15]) * coefficient([applyReactive, -0.2]);
  const reloadCoefficient =
    (coefficient([hasRammer, -0.07]) *
      coefficient([true, degressiveStat(crewMemberMastery)])) /
    coefficient([hasAdrenaline && gun.type === 'regular', 0.2]);
  const penetrationCoefficient = coefficient([
    hasCalibratedShells,
    isExplosive(shell.type) ? 0.1 : 0.05,
  ]);
  const healthCoefficient = coefficient(
    [hasSandbagArmor, 0.03],
    [hasEnhancedSandbagArmor, 0.06],
    [hasImprovedAssembly, 0.06],
  );
  const shellVelocityCoefficient = coefficient(
    [hasSupercharger, 0.3],
    [hasImprovedGunPowder, 0.3],
  );
  const penetrationLossOverDistanceCoefficient = coefficient([
    hasSupercharger,
    -0.5,
  ]);
  const aimTimeCoefficient =
    coefficient(
      [hasEnhancedGunLayingDrive, -0.1],
      [hasReticleCalibration, -0.4],
    ) * coefficient([true, degressiveStat(crewMemberMastery)]);
  const dispersionStillCoefficient =
    coefficient([hasRefinedGun, -0.1], [hasReticleCalibration, -0.4]) *
    coefficient([true, degressiveStat(crewMemberMastery)]);
  const dispersionDamagedCoefficient = coefficient([
    hasVerticalStabilizer,
    -0.15,
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
      hasEngineAccelerator &&
        (tank.class === 'lightTank' || tank.class === 'mediumTank'),
      0.05,
    ],
    [
      hasEngineAccelerator &&
        (tank.class === 'heavyTank' || tank.class === 'AT-SPG'),
      0.07,
    ],
    [hasEnginePowerBoost, 0.2],
    [hasImprovedEnginePowerBoost, 0.4],
    [hasStandardFuel, 0.03],
    [hasImprovedFuel, 0.1],
    [hasGearOil, 0.03],
    [hasImprovedGearOil, 0.06],
  );
  const turretTraverseCoefficient =
    coefficient([hasStandardFuel, 0.03], [hasImprovedFuel, 0.1]) *
    coefficient([true, progressiveStat(crewMemberMastery)]);
  const hullTraverseCoefficient =
    coefficient(
      [hasImprovedControl, 0.1],
      [hasImprovedEnginePowerBoost, 0.05],
      [true, crewSkills.virtuoso / 100],
    ) * coefficient([true, progressiveStat(crewMemberMastery)]);
  const resistanceCoefficient = coefficient([hasImprovedSuspension, -0.25]);
  const viewRangeCoefficient =
    coefficient([
      hasImprovedOptics,
      tank.class === 'AT-SPG' ? 0.05 : tank.class === 'heavyTank' ? 0.07 : 0.1,
    ]) * coefficient([true, progressiveStat(commanderMastery)]);
  const fireChanceCoefficient = coefficient([hasProtectiveKit, -0.2]);

  const speedForwardsSum = sum(
    [hasImprovedEnginePowerBoost, 5],
    [hasGearOil, 2],
    [hasImprovedGearOil, 4],
  );
  const speedBackwardsSum = sum(
    [hasImprovedEnginePowerBoost, 10],
    [hasGearOil, 2],
    [hasImprovedGearOil, 4],
  );
  const camouflageSumMoving = sum(
    [
      hasCamouflageNet,
      tank.class === 'heavyTank' ? 0.03 : tank.class === 'AT-SPG' ? 0.07 : 0.05,
    ],
    [
      camouflage,
      tank.class === 'AT-SPG' ? 0.04 : tank.class === 'heavyTank' ? 0.03 : 0.02,
    ],
  );
  const camouflageSumStill = sum(
    [
      hasCamouflageNet,
      2 *
        (tank.class === 'heavyTank'
          ? 0.03
          : tank.class === 'AT-SPG'
            ? 0.07
            : 0.05),
    ],
    [
      camouflage,
      tank.class === 'AT-SPG' ? 0.04 : tank.class === 'heavyTank' ? 0.03 : 0.02,
    ],
    [true, crewSkills.camouflage * (3 / 100)],
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
  const dpmMaximum =
    gun.type === 'autoReloader'
      ? gun.reload.at(-1)! < gun.reload.at(-2)!
        ? ((damageCoefficient * shell.damage.armor) /
            (gun.reload.at(-1)! * reloadCoefficient +
              gun.intraClip * intraClipCoefficient)) *
          60
        : ((damageCoefficient * shell.damage.armor) /
            (gun.reload[0] * reloadCoefficient)) *
          60
      : undefined;
  const dpmEffective =
    gun.type === 'autoReloader'
      ? gun.reload.at(-1)! < gun.reload.at(-2)!
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
  const mostOptimalShellIndex =
    gun.type === 'autoReloader'
      ? gun.reload.at(-1)! < gun.reload.at(-2)!
        ? gun.reload.length
        : 1
      : undefined;
  const shellReloads =
    gun.type === 'autoReloader'
      ? gun.reload.map((reload) => reload * reloadCoefficient)
      : undefined;
  const shellReload =
    gun.type === 'autoReloader' ? undefined : gun.reload * reloadCoefficient;
  const intraClip =
    gun.type === 'regular' ? undefined : gun.intraClip * intraClipCoefficient;
  const caliber = shell.caliber;
  const penetration =
    resolveNearPenetration(shell.penetration) * penetrationCoefficient;
  const damage = shell.damage.armor * damageCoefficient;
  const moduleDamage = shell.damage.module * damageCoefficient;
  const explosionRadius = shell.explosionRadius;
  const shellVelocity = shell.speed * shellVelocityCoefficient;
  const aimTime = gun.aimTime * aimTimeCoefficient;
  const dispersion = gun.dispersion.base * dispersionStillCoefficient;
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
    (hasImprovedVerticalStabilizer ? 3 : 0);
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
  const powerToWeightRatioHardTerrain =
    resolvedEnginePower /
    weightTons /
    (track.resistance.hard * resistanceCoefficient);
  const powerToWeightRatioMediumTerrain =
    resolvedEnginePower /
    weightTons /
    (track.resistance.medium * resistanceCoefficient);
  const powerToWeightRatioSoftTerrain =
    resolvedEnginePower /
    weightTons /
    (track.resistance.soft * resistanceCoefficient);
  const weight = weightTons;
  const turretTraverseSpeed = turret.traverseSpeed * turretTraverseCoefficient;
  const hullTraverseHardTerrain =
    (resolvedEnginePower / stockEngine.power) *
    track.traverseSpeed *
    hullTraverseCoefficient *
    (track.resistance.hard / (track.resistance.hard * resistanceCoefficient)) *
    (stockWeight / weightKg);
  const hullTraverseMediumTerrain =
    (resolvedEnginePower / stockEngine.power) *
    track.traverseSpeed *
    hullTraverseCoefficient *
    (track.resistance.hard /
      (track.resistance.medium * resistanceCoefficient)) *
    (stockWeight / weightKg);
  const hullTraverseSoftTerrain =
    (resolvedEnginePower / stockEngine.power) *
    track.traverseSpeed *
    hullTraverseCoefficient *
    (track.resistance.hard / (track.resistance.soft * resistanceCoefficient)) *
    (stockWeight / weightKg);
  const health = (tank.health + turret.health) * healthCoefficient;
  const fireChance = engine.fireChance * fireChanceCoefficient;
  const viewRange = turret.viewRange * viewRangeCoefficient;
  const camouflageStill = tank.camouflage.still + camouflageSumStill;
  const camouflageMoving = tank.camouflage.moving + camouflageSumMoving;
  const camouflageShootingStill =
    tank.camouflage.still * gun.camouflageLoss + camouflageSumStill;
  const camouflageShootingMoving =
    tank.camouflage.moving * gun.camouflageLoss + camouflageSumMoving;
  const camouflageCaughtOnFire =
    tank.camouflage.onFire * tank.camouflage.still + camouflageSumStill;
  const width = size[2];
  const height = size[0];
  const length = size[1];
  const volume = width * height * length;

  return {
    dpm,
    dpmMaximum,
    dpmEffective,
    shells,
    mostOptimalShellIndex,
    shellReloads,
    shellReload,
    intraClip,
    caliber,
    penetration,
    damage,
    moduleDamage,
    explosionRadius,
    shellVelocity,
    aimTime,
    dispersion,
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
