import { Flex, Heading } from '@radix-ui/themes';
import { use } from 'react';
import { resolveNearPenetration } from '../../../../../../core/blitz/resolveNearPenetration';
import { modelDefinitions } from '../../../../../../core/blitzkrieg/modelDefinitions';
import { normalizeBoundingBox } from '../../../../../../core/blitzkrieg/normalizeBoundingBox';
import { resolveDpm } from '../../../../../../core/blitzkrieg/resolveDpm';
import {
  GUN_TYPE_NAMES,
  SHELL_NAMES,
} from '../../../../../../core/blitzkrieg/tankDefinitions';
import { unionBoundingBox } from '../../../../../../core/blitzkrieg/unionBoundingBox';
import { useEquipment } from '../../../../../../core/blitzkrieg/useEquipmentEquipped';
import { useDuel } from '../../../../../../stores/duel';
import { Info } from './components/Info';
import { InfoWithDelta } from './components/InfoWithDelta';

export function Characteristics() {
  const awaitedModelDefinitions = use(modelDefinitions);
  const { tank, turret, gun, engine, track } = useDuel(
    (state) => state.protagonist!,
  );
  const stockEngine = tank.engines[0];
  const stockTrack = tank.tracks[0];
  const stockTurret = tank.turrets[0];
  const stockGun = stockTurret.guns[0];
  const shell = gun.shells[0];
  const tankModelDefinition = awaitedModelDefinitions[tank.id];
  const turretModelDefinition = tankModelDefinition.turrets[turret.id];
  const gunModelDefinition = turretModelDefinition.guns[gun.id];
  const size = normalizeBoundingBox(
    unionBoundingBox(
      tankModelDefinition.boundingBox,
      turretModelDefinition.boundingBox,
    ),
  );
  const weight =
    tank.weight + engine.weight + track.weight + turret.weight + gun.weight;
  const weightMt = weight / 1000;
  const stockWeight =
    tank.weight +
    stockEngine.weight +
    stockTrack.weight +
    stockTurret.weight +
    stockGun.weight;
  const hasRammer = useEquipment(100);

  return (
    <Flex direction="column" gap="4" style={{ width: '100%' }}>
      <Flex direction="column" gap="2">
        <Heading size="5">Survivability</Heading>
        <InfoWithDelta name="Health" unit="hp">
          {tank.health + turret.health}
        </InfoWithDelta>
        <InfoWithDelta name="Fire chance" unit="%">
          {Math.round(engine.fireChance * 100)}
        </InfoWithDelta>
        <InfoWithDelta name="View range" unit="m">
          {turret.viewRange}
        </InfoWithDelta>
        <Info name="Camouflage" unit="%" />
        <InfoWithDelta indent name="Still" decimals={2}>
          {tank.camouflage.still * 100}
        </InfoWithDelta>
        <InfoWithDelta indent name="Moving" decimals={2}>
          {tank.camouflage.moving * 100}
        </InfoWithDelta>
        <InfoWithDelta indent name="Shooting still" decimals={2}>
          {tank.camouflage.still * gun.camouflageLoss * 100}
        </InfoWithDelta>
        <InfoWithDelta indent name="Shooting on move" decimals={2}>
          {tank.camouflage.moving * gun.camouflageLoss * 100}
        </InfoWithDelta>
        <InfoWithDelta indent name="On fire" decimals={2}>
          {tank.camouflage.onFire * tank.camouflage.still * 100}
        </InfoWithDelta>
        <Info name="Size" unit="m">
          {size[0].toFixed(2)} x {size[2].toFixed(2)} x {size[1].toFixed(2)}
        </Info>
      </Flex>

      <Flex direction="column" gap="2">
        <Heading size="5">Fire</Heading>
        <Info name="Gun type">{GUN_TYPE_NAMES[gun.type]}</Info>
        <InfoWithDelta name="Damage per minute" decimals={0} unit="hp / min">
          {resolveDpm(gun, shell, hasRammer)}
        </InfoWithDelta>
        {gun.type === 'autoReloader' && (
          <>
            <InfoWithDelta decimals={0} indent name="Maximum" unit="hp / min">
              {gun.reload.at(-1)! < gun.reload.at(-2)!
                ? (shell.damage.armor / (gun.reload.at(-1)! + gun.interClip)) *
                  60
                : (shell.damage.armor / gun.reload[0]) * 60}
            </InfoWithDelta>
            <InfoWithDelta
              decimals={0}
              indent
              name="Effective at 60s"
              unit="hp / min"
            >
              {gun.reload.at(-1)! < gun.reload.at(-2)!
                ? (shell.damage.armor / (gun.reload.at(-1)! + gun.interClip)) *
                    (60 -
                      (gun.reload.slice(0, -1).length - 1) * gun.interClip) +
                  shell.damage.armor * gun.reload.slice(0, -1).length
                : (shell.damage.armor / (gun.reload[0] + gun.interClip)) *
                    (60 - (gun.reload.slice(1).length - 1) * gun.interClip) +
                  shell.damage.armor * gun.reload.slice(1).length}
            </InfoWithDelta>
            <Info
              indent
              name={
                <a
                  target="_blank"
                  href="https://tresabhi.github.io/blitzkrieg/guide/dpm.html"
                >
                  What's the difference?
                </a>
              }
            />
            <Info indent name="Optimal shell index">
              {gun.reload.at(-1)! < gun.reload.at(-2)! ? gun.reload.length : 1}
            </Info>
          </>
        )}
        {gun.type === 'autoReloader' ? (
          gun.reload.map((reload, index) => (
            <InfoWithDelta
              key={index}
              indent={index > 0}
              name={index > 0 ? `Shell ${index + 1}` : 'Reload on shell 1'}
              unit="s"
              decimals={2}
            >
              {reload}
            </InfoWithDelta>
          ))
        ) : (
          <InfoWithDelta decimals={2} name="Reload" unit="s">
            {gun.reload * (hasRammer ? 0.93 : 1)}
          </InfoWithDelta>
        )}
        <InfoWithDelta name="Caliber" decimals={0} unit="mm">
          {shell.caliber}
        </InfoWithDelta>
        <Info name="Penetration" unit="mm" />
        {gun.shells.map((shell) => (
          <InfoWithDelta
            decimals={0}
            key={shell.type}
            indent
            name={SHELL_NAMES[shell.type]}
          >
            {resolveNearPenetration(shell.penetration)}
          </InfoWithDelta>
        ))}
        <Info name="Damage" unit="hp" />
        {gun.shells.map((shell) => (
          <InfoWithDelta
            decimals={0}
            key={shell.type}
            indent
            name={SHELL_NAMES[shell.type]}
          >
            {shell.damage.armor}
          </InfoWithDelta>
        ))}
        <Info name="Module damage" unit="hp" />
        {gun.shells.map((shell, index) => (
          <InfoWithDelta
            decimals={0}
            key={shell.type}
            indent
            name={SHELL_NAMES[shell.type]}
          >
            {shell.damage.module}
          </InfoWithDelta>
        ))}
        <Info name="Shell velocity" unit="m/s" />
        {gun.shells.map((shell) => (
          <InfoWithDelta
            decimals={0}
            key={shell.type}
            indent
            name={SHELL_NAMES[shell.type]}
          >
            {shell.speed}
          </InfoWithDelta>
        ))}
        <InfoWithDelta decimals={2} name="Aim time" unit="s">
          {gun.aimTime}
        </InfoWithDelta>
        <Info name="Dispersion at 100m" />
        <InfoWithDelta decimals={3} indent name="Still" unit="m">
          {gun.dispersion.base}
        </InfoWithDelta>
        <InfoWithDelta prefix="+ " decimals={3} indent name="Moving" unit="s">
          {track.dispersion.move}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={3}
          prefix="+ "
          indent
          name="Hull traversing"
          unit="°"
        >
          {track.dispersion.traverse}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={0}
          prefix="+ "
          indent
          name="Turret traversing"
          unit="°"
        >
          {gun.dispersion.traverse}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={3}
          prefix="+ "
          indent
          name="After shooting"
          unit="m"
        >
          {gun.dispersion.shot}
        </InfoWithDelta>
        <InfoWithDelta
          decimals={3}
          prefix="x "
          indent
          name="Gun damaged"
          unit="scalar"
        >
          {gun.dispersion.damaged}
        </InfoWithDelta>
        <Info name="Gun flexibility" unit="°" />
        <InfoWithDelta decimals={1} indent name="Depression">
          {gunModelDefinition.pitch.max}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="Elevation">
          {-gunModelDefinition.pitch.min}
        </InfoWithDelta>
        {gunModelDefinition.pitch.front && (
          <>
            <InfoWithDelta decimals={1} indent name="Frontal depression">
              {gunModelDefinition.pitch.front.max}
            </InfoWithDelta>
            <InfoWithDelta decimals={1} indent name="Frontal elevation">
              {-gunModelDefinition.pitch.front.min}
            </InfoWithDelta>
          </>
        )}
        {gunModelDefinition.pitch.back && (
          <>
            <InfoWithDelta decimals={1} indent name="Rear depression">
              {gunModelDefinition.pitch.back.max}
            </InfoWithDelta>
            <InfoWithDelta decimals={1} indent name="Rear elevation">
              {-gunModelDefinition.pitch.back.min}
            </InfoWithDelta>
          </>
        )}
        {turretModelDefinition.yaw && (
          <>
            <InfoWithDelta decimals={1} indent name="Azimuth left">
              {-turretModelDefinition.yaw.min}
            </InfoWithDelta>
            <InfoWithDelta decimals={1} indent name="Azimuth right">
              {turretModelDefinition.yaw.max}
            </InfoWithDelta>
          </>
        )}
      </Flex>

      <Flex direction="column" gap="2">
        <Heading size="5">Maneuverability</Heading>
        <Info name="Speed" unit="km/hr" />
        <InfoWithDelta decimals={0} indent name="Forwards">
          {tank.speed.forwards}
        </InfoWithDelta>
        <InfoWithDelta decimals={0} indent name="Backwards">
          {tank.speed.backwards}
        </InfoWithDelta>
        <InfoWithDelta decimals={0} name="Power" unit="hp">
          {engine.power}
        </InfoWithDelta>
        <Info name="Power to weight ratio" unit="hp/mt" />
        <InfoWithDelta decimals={1} indent name="On hard terrain">
          {engine.power / weightMt / track.resistance.hard}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="On medium terrain">
          {engine.power / weightMt / track.resistance.medium}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="On soft terrain">
          {engine.power / weightMt / track.resistance.soft}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} name="Weight" unit="mt">
          {weightMt}
        </InfoWithDelta>
        <Info name="Effective traverse speed" unit="°/s" />
        <InfoWithDelta decimals={1} indent name="On hard terrain">
          {(engine.power / stockEngine.power) *
            track.traverseSpeed *
            (track.resistance.hard / track.resistance.hard) *
            (stockWeight / weight)}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="On medium terrain">
          {(engine.power / stockEngine.power) *
            track.traverseSpeed *
            (track.resistance.hard / track.resistance.medium) *
            (stockWeight / weight)}
        </InfoWithDelta>
        <InfoWithDelta decimals={1} indent name="On soft terrain">
          {(engine.power / stockEngine.power) *
            track.traverseSpeed *
            (track.resistance.hard / track.resistance.soft) *
            (stockWeight / weight)}
        </InfoWithDelta>
      </Flex>
    </Flex>
  );
}
