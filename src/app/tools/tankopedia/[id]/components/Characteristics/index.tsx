import { Flex, Heading, Tabs } from '@radix-ui/themes';
import { Camouflage } from './components/Camouflage';
import { Consumables } from './components/Consumables';
import { Crew } from './components/Crew';
import { Equipments } from './components/Equipments';
import { Info } from './components/Info';
import { Modules } from './components/Modules';
import { Provisions } from './components/Provisions';

export function Characteristics() {
  return (
    <Tabs.Root defaultValue="configure" style={{ width: '100%' }}>
      <Flex gap="4" direction="column">
        <Tabs.List>
          <Tabs.Trigger value="configure">Configure</Tabs.Trigger>
          <Tabs.Trigger value="statistics">Statistics</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="statistics">
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="2">
              <Heading size="5">Survivability</Heading>
              <Info name="Health" value="2014" unit="hp" />
              <Info name="Fire chance" value="20" unit="%" />
              <Info name="View range" value="302" unit="m" />
              <Info name="Camouflage when still" value="30.00" unit="%" />
              <Info indent name="Moving" value="30.00" unit="%" />
              <Info indent name="Shooting" value="30.00" unit="%" />
              <Info indent name="Shooting and moving" value="30.00" unit="%" />
              <Info indent name="Size" value="6.21 x 2.43 x 2.00" unit="m" />
            </Flex>

            <Flex direction="column" gap="2">
              <Heading size="5">Fire</Heading>
              <Info name="Damage per minute" value="2316" unit="hp / min" />
              <Info indent name="Maximum" value="2316" unit="hp / min" />
              <Info indent name="Effective" value="2316" unit="hp / min" />
              <Info name="Reload" value="5.73" unit="s" />
              <Info name="AP penetration" value="273" unit="mm" />
              <Info indent name="AP at 500m" value="253" unit="mm" />
              <Info indent name="APCR" value="312" unit="mm" />
              <Info indent name="APCR at 500m" value="300" unit="mm" />
              <Info indent name="HE" value="90" unit="mm" />
              <Info indent name="Caliber" value="100" unit="mm" />
              <Info name="AP damage" value="400" unit="hp" />
              <Info name="Shell velocity" value="1535" unit="m/s" />
              <Info indent name="AP module damage" value="130" unit="hp" />
              <Info indent name="APCR" value="340" unit="hp" />
              <Info indent name="APCR module" value="110" unit="hp" />
              <Info indent name="HE" value="520" unit="hp" />
              <Info indent name="HE module" value="200" unit="hp" />
              <Info name="Aim time" value="1.72" unit="s" />
              <Info name="Dispersion at 100m" value="0.326" unit="m" />
              <Info indent name="On move" value="0.100" unit="m" />
              <Info indent name="On hull traverse" value="0.100" unit="m" />
              <Info indent name="On turret traverse" value="0.070" unit="m" />
              <Info indent name="On shoot" value="3.500" unit="m" />
              <Info name="Gun depression" value="20" unit="°" />
              <Info indent name="Elevation" value="7" unit="°" />
              <Info indent name="Frontal depression" value="7" unit="°" />
              <Info indent name="Frontal elevation" value="7" unit="°" />
              <Info indent name="Rear depression" value="7" unit="°" />
              <Info indent name="Rear elevation" value="7" unit="°" />
              <Info indent name="Azimuth" value="30, 30" unit="°" />
            </Flex>

            <Flex direction="column" gap="2">
              <Heading size="5">Maneuverability</Heading>
              <Info name="Speed forwards" value="55" unit="km/s" />
              <Info indent name="Backward" value="20" unit="km/s" />
              {/* TODO: average speed? */}
              <Info
                name="Effective power on hard terrain"
                value="36.86"
                unit="hp/kg"
              />
              <Info
                indent
                name="On medium terrain"
                value="36.86"
                unit="hp/kg"
              />
              <Info indent name="On soft terrain" value="36.86" unit="hp/kg" />
              <Info name="Weight" value="45" unit="mt" />
              <Info
                name="Traverse speed on hard terrain"
                value="36.86"
                unit="°/s"
              />
              <Info indent name="On medium terrain" value="36.86" unit="°/s" />
              <Info indent name="On soft terrain" value="36.86" unit="°/s" />
            </Flex>
          </Flex>
        </Tabs.Content>

        <Tabs.Content value="configure">
          <Flex direction="column" gap="4">
            <Modules />
            <Equipments />
            <Crew />
            <Consumables />
            <Provisions />
            <Camouflage />
          </Flex>
        </Tabs.Content>
      </Flex>
    </Tabs.Root>
  );
}
