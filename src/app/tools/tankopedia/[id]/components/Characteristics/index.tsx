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
  const { tank, turret, gun, shell, engine } = useDuel(
    (state) => state.protagonist!,
  );
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
  } else if (gun.type === 'auto_loader') {
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
    <Flex direction="column" gap="4">
      <Flex direction="column" gap="2">
        <Heading size="5">Survivability</Heading>
        <Info name="Health" unit="hp">
          {tank.health + turret.health}
        </Info>
        <Info name="Fire chance" unit="%">
          {Math.round(engine.fire_chance * 100)}
        </Info>
        <Info name="View range" unit="m">
          {turret.view_range}
        </Info>
        <Info name="Camouflage when still" unit="%">
          {(tank.camouflage.still * 100).toFixed(2)}
        </Info>
        <Info indent name="Moving" unit="%">
          {(tank.camouflage.moving * 100).toFixed(2)}
        </Info>
        <Info indent name="Shooting still" unit="%">
          {(tank.camouflage.still * gun.camouflageLoss * 100).toFixed(2)}
        </Info>
        <Info indent name="Shooting on move" unit="%">
          {(tank.camouflage.moving * gun.camouflageLoss * 100).toFixed(2)}
        </Info>
        <Info indent name="On fire penalty" unit="%">
          {(tank.camouflage.onFire * 100).toFixed(2)}
        </Info>
        <Info indent name="Size" unit="m">
          {size.map((component) => component.toFixed(2)).join(' x ')}
        </Info>
      </Flex>

      <Flex direction="column" gap="2">
        <Heading size="5">Fire</Heading>
        <Info name="Gun type">{GUN_TYPE_NAMES[gun.type]}</Info>
        <Info name="Damage per minute" unit="hp / min">
          {dpm.toFixed(0)}
        </Info>
        {gun.type === 'auto_reloader' && (
          <>
            <Info indent name="Maximum" unit="hp / min">
              TODO
            </Info>
            <Info indent name="Effective" unit="hp / min">
              TODO
            </Info>
          </>
        )}
        {gun.type === 'auto_reloader' ? (
          gun.reload.map((reload, index) => (
            <Info
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
        {gun.shells.map((shell, index) => (
          <Info
            indent={index > 0}
            name={`${SHELL_NAMES[shell.type]}${index === 0 ? ' penetration' : ''}`}
            unit="mm"
          >
            {resolveNearPenetration(shell.penetration)}
          </Info>
        ))}
        {gun.shells.map((shell, index) => (
          <Info
            indent={index > 0}
            name={`${SHELL_NAMES[shell.type]}${index === 0 ? ' damage' : ''}`}
            unit="hp"
          >
            {shell.damage.armor}
          </Info>
        ))}
        {gun.shells.map((shell, index) => (
          <Info
            indent={index > 0}
            name={`${SHELL_NAMES[shell.type]}${index === 0 ? ' module damage' : ''}`}
            unit="hp"
          >
            {shell.damage.module}
          </Info>
        ))}
        {gun.shells.map((shell, index) => (
          <Info
            indent={index > 0}
            name={`${SHELL_NAMES[shell.type]}${index === 0 ? ' velocity' : ''}`}
            unit="m/s"
          >
            {shell.speed}
          </Info>
        ))}
        <Info name="Aim time" unit="s">
          TODO
        </Info>
        <Info name="Dispersion at 100m" unit="m">
          TODO
        </Info>
        <Info indent name="On move" unit="m">
          TODO
        </Info>
        <Info indent name="On hull traverse" unit="m">
          TODO
        </Info>
        <Info indent name="On turret traverse" unit="m">
          TODO
        </Info>
        <Info indent name="On shoot" unit="m">
          TODO
        </Info>
        <Info name="Gun depression" unit="°">
          {gunModelDefinition.pitch.max}
        </Info>
        <Info indent name="Elevation" unit="°">
          {-gunModelDefinition.pitch.min}
        </Info>
        {gunModelDefinition.pitch.front && (
          <>
            <Info indent name="Frontal depression" unit="°">
              {gunModelDefinition.pitch.front.max}
            </Info>
            <Info indent name="Frontal elevation" unit="°">
              {-gunModelDefinition.pitch.front.min}
            </Info>
          </>
        )}
        {gunModelDefinition.pitch.back && (
          <>
            <Info indent name="Rear depression" unit="°">
              {gunModelDefinition.pitch.back.max}
            </Info>
            <Info indent name="Rear elevation" unit="°">
              {-gunModelDefinition.pitch.back.min}
            </Info>
          </>
        )}
        {turretModelDefinition.yaw && (
          <Info indent name="Azimuth" unit="°">
            {-turretModelDefinition.yaw.min}, {turretModelDefinition.yaw.max}
          </Info>
        )}
      </Flex>

      <Flex direction="column" gap="2">
        <Heading size="5">Maneuverability</Heading>
        <Info name="Speed forwards" unit="km/s">
          TODO
        </Info>
        <Info indent name="Average" unit="km/s">
          TODO
        </Info>
        <Info indent name="Backwards" unit="km/s">
          TODO
        </Info>
        <Info name="Effective power on hard terrain" unit="hp/kg">
          TODO
        </Info>
        <Info indent name="On medium terrain" unit="hp/kg">
          TODO
        </Info>
        <Info indent name="On soft terrain" unit="hp/kg">
          TODO
        </Info>
        <Info name="Weight" unit="mt">
          TODO
        </Info>
        <Info name="Traverse speed on hard terrain" unit="°/s">
          TODO
        </Info>
        <Info indent name="On medium terrain" unit="°/s">
          TODO
        </Info>
        <Info indent name="On soft terrain" unit="°/s">
          TODO
        </Info>
      </Flex>
    </Flex>
  );
}
