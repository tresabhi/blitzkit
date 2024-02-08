import { Flex, Heading } from '@radix-ui/themes';
import { use } from 'react';
import { resolveNearPenetration } from '../../../../../../core/blitz/resolveNearPenetration';
import { modelDefinitions } from '../../../../../../core/blitzkrieg/modelDefinitions';
import { normalizeBoundingBox } from '../../../../../../core/blitzkrieg/normalizeBoundingBox';
import {
  GUN_TYPE_NAMES,
  SHELL_NAMES,
} from '../../../../../../core/blitzkrieg/tankDefinitions';
import { unionBoundingBox } from '../../../../../../core/blitzkrieg/unionBoundingBox';
import { useDuel } from '../../../../../../stores/duel';
import { Info } from './components/Info';

export function Characteristics() {
  const awaitedModelDefinitions = use(modelDefinitions);
  const { tank, turret, gun, engine } = useDuel((state) => state.protagonist!);
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

  let dpm: number;

  if (gun.type === 'regular') {
    dpm = (shell.damage.armor / gun.reload) * 60;
  } else if (gun.type === 'autoLoader') {
    dpm =
      ((shell.damage.armor * gun.count) /
        (gun.reload + (gun.count - 1) * gun.interClip)) *
      60;
  } else {
    dpm =
      ((shell.damage.armor * gun.count) /
        (gun.reload.reduce((a, b) => a + b, 0) +
          (gun.count - 1) * gun.interClip)) *
      60;
  }

  return (
    <Flex direction="column" gap="4" style={{ width: '100%' }}>
      <Flex direction="column" gap="2">
        <Heading size="5">Survivability</Heading>
        <Info name="Health" unit="hp">
          {tank.health + turret.health}
        </Info>
        <Info name="Fire chance" unit="%">
          {Math.round(engine.fire_chance * 100)}
        </Info>
        <Info name="View range" unit="m">
          {turret.viewRange}
        </Info>
        <Info name="Camouflage" unit="%" />
        <Info indent name="Still">
          {(tank.camouflage.still * 100).toFixed(2)}
        </Info>
        <Info indent name="Moving">
          {(tank.camouflage.moving * 100).toFixed(2)}
        </Info>
        <Info indent name="Shooting still">
          {(tank.camouflage.still * gun.camouflageLoss * 100).toFixed(2)}
        </Info>
        <Info indent name="Shooting on move">
          {(tank.camouflage.moving * gun.camouflageLoss * 100).toFixed(2)}
        </Info>
        <Info indent name="On fire">
          {(tank.camouflage.onFire * tank.camouflage.still * 100).toFixed(2)}
        </Info>
        <Info name="Size" unit="m">
          {size.map((component) => component.toFixed(2)).join(' x ')}
        </Info>
      </Flex>

      <Flex direction="column" gap="2">
        <Heading size="5">Fire</Heading>
        <Info name="Gun type">{GUN_TYPE_NAMES[gun.type]}</Info>
        <Info name="Damage per minute" unit="hp / min">
          {dpm.toFixed(0)}
        </Info>
        {gun.type === 'autoReloader' && (
          <>
            <Info indent name="Maximum" unit="hp / min">
              {gun.reload.at(-1)! < gun.reload.at(-2)!
                ? (
                    (shell.damage.armor /
                      (gun.reload.at(-1)! + gun.interClip)) *
                    60
                  ).toFixed(0)
                : ((shell.damage.armor / gun.reload[0]) * 60).toFixed(0)}
            </Info>
            <Info indent name="Effective at 60s" unit="hp / min">
              {gun.reload.at(-1)! < gun.reload.at(-2)!
                ? (
                    (shell.damage.armor /
                      (gun.reload.at(-1)! + gun.interClip)) *
                      (60 -
                        (gun.reload.slice(0, -1).length - 1) * gun.interClip) +
                    shell.damage.armor * gun.reload.slice(0, -1).length
                  ).toFixed(0)
                : (
                    (shell.damage.armor / (gun.reload[0] + gun.interClip)) *
                      (60 - (gun.reload.slice(1).length - 1) * gun.interClip) +
                    shell.damage.armor * gun.reload.slice(1).length
                  ).toFixed(0)}
            </Info>
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
            <Info
              key={index}
              indent={index > 0}
              name={index > 0 ? `Shell ${index + 1}` : 'Reload on shell 1'}
              unit="s"
            >
              {reload.toFixed(2)}
            </Info>
          ))
        ) : (
          <Info name="Reload" unit="s">
            {gun.reload.toFixed(2)}
          </Info>
        )}
        <Info name="Caliber" unit="mm">
          {shell.caliber}
        </Info>
        <Info name="Penetration" unit="mm" />
        {gun.shells.map((shell) => (
          <Info key={shell.type} indent name={SHELL_NAMES[shell.type]}>
            {resolveNearPenetration(shell.penetration)}
          </Info>
        ))}
        <Info name="Damage" unit="hp" />
        {gun.shells.map((shell) => (
          <Info key={shell.type} indent name={SHELL_NAMES[shell.type]}>
            {shell.damage.armor}
          </Info>
        ))}
        <Info name="Module damage" unit="hp" />
        {gun.shells.map((shell, index) => (
          <Info key={shell.type} indent name={SHELL_NAMES[shell.type]}>
            {shell.damage.module}
          </Info>
        ))}
        <Info name="Shell velocity" unit="m/s" />
        {gun.shells.map((shell, index) => (
          <Info key={shell.type} indent name={SHELL_NAMES[shell.type]}>
            {shell.speed}
          </Info>
        ))}
        <Info name="Aim time" unit="s">
          {gun.aimTime.toFixed(2)}
        </Info>
        <Info name="Dispersion at 100m" />
        <Info indent name="Still" unit="m">
          {gun.dispersion.base.toFixed(3)}
        </Info>
        <Info indent name="Moving" unit="s">
          + {tank.dispersion.move.toFixed(3)}
        </Info>
        <Info indent name="Hull traversing" unit="s">
          + {tank.dispersion.traverse.toFixed(3)}
        </Info>
        <Info indent name="Turret traversing" unit="s">
          + {gun.dispersion.traverse.toFixed(3)}
        </Info>
        <Info indent name="After shooting" unit="m">
          + {gun.dispersion.shot.toFixed(3)}
        </Info>
        <Info indent name="Gun damaged" unit="scalar">
          x {gun.dispersion.damaged.toFixed(3)}
        </Info>
        <Info name="Gun flexibility" unit="°" />
        <Info indent name="Depression">
          {gunModelDefinition.pitch.max}
        </Info>
        <Info indent name="Elevation">
          {-gunModelDefinition.pitch.min}
        </Info>
        {gunModelDefinition.pitch.front && (
          <>
            <Info indent name="Frontal depression">
              {gunModelDefinition.pitch.front.max}
            </Info>
            <Info indent name="Frontal elevation">
              {-gunModelDefinition.pitch.front.min}
            </Info>
          </>
        )}
        {gunModelDefinition.pitch.back && (
          <>
            <Info indent name="Rear depression">
              {gunModelDefinition.pitch.back.max}
            </Info>
            <Info indent name="Rear elevation">
              {-gunModelDefinition.pitch.back.min}
            </Info>
          </>
        )}
        {turretModelDefinition.yaw && (
          <Info indent name="Azimuth">
            {-turretModelDefinition.yaw.min}, {turretModelDefinition.yaw.max}
          </Info>
        )}
      </Flex>

      <Flex direction="column" gap="2">
        <Heading size="5">Maneuverability</Heading>
        <Info name="Speed" unit="km/s" />
        <Info indent name="Forwards">
          TODO
        </Info>
        <Info indent name="Average">
          TODO
        </Info>
        <Info indent name="Backwards">
          TODO
        </Info>
        <Info name="Power to weight ratio" unit="hp/kg" />
        <Info indent name="On hard terrain">
          TODO
        </Info>
        <Info indent name="On medium terrain">
          TODO
        </Info>
        <Info indent name="On soft terrain">
          TODO
        </Info>
        <Info name="Weight" unit="mt">
          TODO
        </Info>
        <Info name="Traverse speed" unit="°/s" />
        <Info indent name="On hard terrain">
          TODO
        </Info>
        <Info indent name="On medium terrain">
          TODO
        </Info>
        <Info indent name="On soft terrain">
          TODO
        </Info>
      </Flex>
    </Flex>
  );
}
