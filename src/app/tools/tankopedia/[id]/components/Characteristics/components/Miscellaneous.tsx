import { Flex, Heading } from '@radix-ui/themes';
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

  return (
    <ConfigurationChildWrapper>
      <Heading size="4">Miscellaneous</Heading>

      <Flex gap="2">
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
