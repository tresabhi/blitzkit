import { asset, TankType } from '@blitzkit/core';
import { Flex, Heading, Slider, TextField } from '@radix-ui/themes';
import { clamp, debounce } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Duel } from '../../../../stores/duel';
import { GenericTankComponentButton } from '../../../ModuleButtons/GenericTankComponentButton';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Miscellaneous() {
  const mutateDuel = Duel.useMutation();
  const camouflage = Duel.use((state) => state.protagonist.camouflage);
  const cooldownBooster = Duel.use(
    (state) => state.protagonist.cooldownBooster,
  );
  const crewMastery = Duel.use((state) => state.protagonist.crewMastery);
  const crewInput = useRef<HTMLInputElement>(null);
  const [crewMasteryDraft, setCrewMasteryDraft] = useState(crewMastery);
  const { tank } = Duel.use((state) => state.protagonist);

  const debouncedApplyDraft = useMemo(
    () =>
      debounce((value) => {
        mutateDuel((draft) => {
          draft.protagonist.crewMastery = value;
        });
      }, 500),
    [],
  );

  useEffect(() => {
    setCrewMasteryDraft(crewMastery);
    if (!crewInput.current) return;
    crewInput.current.value = `${Math.round(crewMastery * 100)}`;
  }, [crewMastery]);

  return (
    <ConfigurationChildWrapper>
      <Heading size="4">Miscellaneous</Heading>

      <Flex gap="2" align="center">
        {!tank.fixed_camouflage && (
          <GenericTankComponentButton
            icon={asset('icons/camo.webp')}
            selected={camouflage}
            iconStyles={{
              top: '50%',
              left: '50%',
              transform: 'translate(calc(-50% + 4px), calc(-50% + 4px))',
            }}
            onClick={() => {
              mutateDuel((draft) => {
                draft.protagonist.camouflage = !camouflage;
              });
            }}
          />
        )}
        <GenericTankComponentButton
          icon={asset('icons/boosters/equipment.webp')}
          selected={cooldownBooster > 0}
          banner={
            cooldownBooster === 0
              ? undefined
              : cooldownBooster === 1
                ? '#afb0abc0'
                : cooldownBooster === 2
                  ? '#5f72cbc0'
                  : '#9b3cc0c0'
          }
          iconStyles={{
            transform: 'translate(-50%, -50%) scale(0.8)',
          }}
          onClick={() => {
            mutateDuel((draft) => {
              draft.protagonist.cooldownBooster++;
              if (draft.protagonist.cooldownBooster === 4)
                draft.protagonist.cooldownBooster = 0;
            });
          }}
        />

        {tank.type === TankType.RESEARCHABLE && (
          <Flex
            align="center"
            direction="column"
            gap="1"
            justify="end"
            style={{ width: 120 }}
          >
            <TextField.Root
              ref={crewInput}
              defaultValue={Math.round(crewMastery * 100)}
              style={{ textAlign: 'right' }}
              onBlur={() => {
                const newValue = Number(crewInput.current!.value) / 100;

                if (isNaN(newValue)) {
                  crewInput.current!.value = `${Math.round(crewMastery * 100)}`;
                  return;
                }

                mutateDuel((draft) => {
                  draft.protagonist.crewMastery = clamp(newValue / 100, 0.5, 1);
                });
              }}
              onKeyUp={(event) => {
                if (event.key === 'Enter') {
                  crewInput.current?.blur();
                }
              }}
            >
              <TextField.Slot>Crew</TextField.Slot>
              <TextField.Slot>%</TextField.Slot>
            </TextField.Root>

            <Slider
              min={50}
              max={100}
              value={[crewMasteryDraft * 100]}
              style={{ width: '100%' }}
              onValueChange={([value]) => {
                setCrewMasteryDraft(value / 100);
                debouncedApplyDraft(value / 100);
              }}
            />
          </Flex>
        )}
      </Flex>
    </ConfigurationChildWrapper>
  );
}
