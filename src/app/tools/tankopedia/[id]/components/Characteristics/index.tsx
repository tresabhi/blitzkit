import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { Flex, Heading } from '@radix-ui/themes';
import { useState } from 'react';
import { Camouflage } from './components/Camouflage';
import { Consumables } from './components/Consumables';
import { Crew } from './components/Crew';
import { Equipments } from './components/Equipments';
import { Info } from './components/Info';
import { Modules } from './components/Modules';
import { Provisions } from './components/Provisions';

interface CharacteristicsProps {
  config?: boolean;
}

export function Characteristics({ config }: CharacteristicsProps) {
  const [configureVisible, setConfigureVisible] = useState(true);
  const [statsVisible, setStatsVisible] = useState(true);

  return (
    <Flex gap="8" direction="column" wrap="wrap">
      {config && (
        <Flex
          style={{ flex: 1, minWidth: 320, position: 'sticky', top: 64 }}
          direction="column"
          gap="4"
        >
          <Heading
            onClick={() => setConfigureVisible((state) => !state)}
            style={{
              cursor: 'pointer',
            }}
          >
            Configure{' '}
            {configureVisible ? <ChevronDownIcon /> : <ChevronUpIcon />}
          </Heading>

          {configureVisible && (
            <Flex direction="column" gap="4">
              <Modules />
              <Equipments />
              <Crew />
              <Consumables />
              <Provisions />
              <Camouflage />
            </Flex>
          )}
        </Flex>
      )}

      {!config && (
        <Flex
          style={{ flex: 1, minWidth: 320, position: 'sticky', top: 64 }}
          direction="column"
          gap="4"
        >
          <Heading
            onClick={() => setStatsVisible((state) => !state)}
            style={{
              cursor: 'pointer',
            }}
          >
            Statistics {statsVisible ? <ChevronDownIcon /> : <ChevronUpIcon />}
          </Heading>

          {statsVisible && (
            <Flex direction="column" gap="4">
              <Flex direction="column" gap="2">
                <Heading size="4">Survivability</Heading>
                <Info name="Health" value="2014" unit="hp" />
              </Flex>

              <Flex direction="column" gap="2">
                <Heading size="4">Lethality</Heading>
                <Info name="Armor damage" value="330" unit="hp" />
                <Info indent name="Module damage" value="125" unit="hp" />
                <Info indent name="Caliber" value="100" unit="mm" />
                <Info name="Penetration" value="257" unit="mm" />
                <Info indent name="At 500m" value="240" unit="mm" />
                <Info name="Damage per minute" value="2316" unit="hp / min" />
                <Info indent name="Maximum" value="2316" unit="hp / min" />
                <Info
                  indent
                  name="Effective at 60s"
                  value="2316"
                  unit="hp / min"
                />
                <Info name="Reload" value="5.73" unit="s" />
                <Info name="Shell velocity" value="1535" unit="m/s" />
                <Info name="Aim time" value="1.72" unit="s" />
                <Info name="Dispersion" value="0.326" unit="m" />
                <Info indent name="On move" value="0.100" unit="m" />
                <Info indent name="On hull traverse" value="0.100" unit="m" />
                <Info indent name="On turret traverse" value="0.070" unit="m" />
                <Info indent name="On shoot" value="3.500" unit="m" />
              </Flex>

              <Flex direction="column" gap="2">
                <Heading size="4">Flexibility</Heading>
                <Info name="Gun depression" value="20" unit="°" />
                <Info indent name="Elevation" value="7" unit="°" />
                <Info indent name="Azimuth" value="30, 30" unit="°" />
              </Flex>

              <Flex direction="column" gap="2">
                <Heading size="4">Mobility</Heading>
                <Info name="Weight" value="45" unit="mt" />
                <Info name="Speed forwards" value="55" unit="km/s" />
                <Info indent name="Backward" value="20" unit="km/s" />
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
                <Info
                  indent
                  name="On soft terrain"
                  value="36.86"
                  unit="hp/kg"
                />
                <Info
                  name="Traverse speed on hard terrain"
                  value="36.86"
                  unit="°/s"
                />
                <Info
                  indent
                  name="On medium terrain"
                  value="36.86"
                  unit="°/s"
                />
                <Info indent name="On soft terrain" value="36.86" unit="°/s" />
              </Flex>

              <Flex direction="column" gap="2">
                <Heading size="4">Stealth</Heading>
                <Info name="View range" value="302" unit="m" />
                <Info name="Size" value="6.21 x 2.43 x 2.00" unit="m" />
                <Info name="Camouflage when still" value="30.00" unit="%" />
                <Info indent name="When moving" value="30.00" unit="%" />
                <Info
                  indent
                  name="When shooting still"
                  value="30.00"
                  unit="%"
                />
                <Info
                  indent
                  name="When shooting while moving"
                  value="30.00"
                  unit="%"
                />
              </Flex>
            </Flex>
          )}
        </Flex>
      )}
    </Flex>
  );
}
