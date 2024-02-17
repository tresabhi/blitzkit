import { Flex, Heading, Slider, TextField } from '@radix-ui/themes';
import { clamp, debounce } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GenericTankComponentButton } from '../../../../../../../components/ModuleButtons/GenericTankComponentButton';
import { asset } from '../../../../../../../core/blitzkrieg/asset';
import {
  mutateTankopediaTemporary,
  useTankopediaTemporary,
} from '../../../../../../../stores/tankopedia';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Miscellaneous() {
  const camouflage = useTankopediaTemporary((state) => state.camouflage);
  const cooldownBooster = useTankopediaTemporary(
    (state) => state.cooldownBooster,
  );
  const crew = useTankopediaTemporary((state) => state.crew);
  const crewInput = useRef<HTMLInputElement>(null);
  const [crewDraft, setCrewDraft] = useState(crew);

  const debouncedApplyDraft = useMemo(
    () =>
      debounce((value) => {
        mutateTankopediaTemporary((draft) => {
          draft.crew = value;
        });
      }, 500),
    [],
  );

  useEffect(() => {
    setCrewDraft(crew);
    if (!crewInput.current) return;
    crewInput.current.value = `${Math.round(crew * 100)}`;
  }, [crew]);

  return (
    <ConfigurationChildWrapper>
      <Heading size="4">Miscellaneous</Heading>

      <Flex gap="2" align="center">
        <Flex
          align="center"
          direction="column"
          gap="1"
          justify="end"
          style={{ width: 180 }}
        >
          <TextField.Root>
            <TextField.Slot>Crew</TextField.Slot>
            <TextField.Input
              ref={crewInput}
              defaultValue={Math.round(crew * 100)}
              style={{ textAlign: 'right' }}
              onBlur={() => {
                const newValue = Number(crewInput.current!.value) / 100;

                if (isNaN(newValue)) {
                  crewInput.current!.value = `${Math.round(crew * 100)}`;
                  return;
                }

                mutateTankopediaTemporary((draft) => {
                  draft.crew = clamp(newValue / 100, 0.5, 1);
                });
              }}
              onKeyUp={(event) => {
                if (event.key === 'Enter') {
                  crewInput.current?.blur();
                }
              }}
            />
            <TextField.Slot>%</TextField.Slot>
          </TextField.Root>

          <Slider
            min={50}
            max={100}
            value={[crewDraft * 100]}
            style={{ width: '100%' }}
            onValueChange={([value]) => {
              setCrewDraft(value / 100);
              debouncedApplyDraft(value / 100);
            }}
          />
        </Flex>

        <GenericTankComponentButton
          icon={asset('icons/camo.webp')}
          selected={camouflage}
          iconStyles={{
            top: '50%',
            left: '50%',
            transform: 'translate(calc(-50% + 4px), calc(-50% + 4px))',
          }}
          first
          last
          onClick={() => {
            mutateTankopediaTemporary((draft) => {
              draft.camouflage = !camouflage;
            });
          }}
        />

        <GenericTankComponentButton
          icon={asset('icons/boosters/equipment.webp')}
          selected={cooldownBooster > 0}
          first
          last
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
            mutateTankopediaTemporary((draft) => {
              draft.cooldownBooster++;
              if (draft.cooldownBooster === 4) draft.cooldownBooster = 0;
            });
          }}
        />
      </Flex>
    </ConfigurationChildWrapper>
  );
}
