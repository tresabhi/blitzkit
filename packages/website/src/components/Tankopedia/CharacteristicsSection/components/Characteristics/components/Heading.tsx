import { TIER_ROMAN_NUMERALS } from '@blitzkit/core';
import strings from '@blitzkit/core/lang/en-US.json';
import { Flex, Heading, SegmentedControl, Text } from '@radix-ui/themes';
import { Duel } from '../../../../../../stores/duel';
import {
  TankopediaEphemeral,
  TankopediaRelativeAgainst,
} from '../../../../../../stores/tankopediaEphemeral';

export function CharacteristicsHeading() {
  const relativeAgainst = TankopediaEphemeral.use(
    (state) => state.relativeAgainst,
  );
  const tank = Duel.use((state) => state.protagonist.tank);
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();

  return (
    <Flex
      align={{ initial: 'stretch', md: 'start' }}
      gap="2"
      direction="column"
    >
      <Heading mb="2">Characteristics</Heading>

      <Text color="gray">Compare against</Text>
      <SegmentedControl.Root
        size={{ initial: '1', md: '2' }}
        value={`${relativeAgainst}`}
        onValueChange={(value) => {
          mutateTankopediaEphemeral((draft) => {
            draft.relativeAgainst = Number(value) as TankopediaRelativeAgainst;
          });
        }}
      >
        <SegmentedControl.Item value={`${TankopediaRelativeAgainst.Class}`}>
          Tier {TIER_ROMAN_NUMERALS[tank.tier]}{' '}
          {strings.common.tank_class_short_plural_lowercase[tank.class]}
        </SegmentedControl.Item>
        <SegmentedControl.Item value={`${TankopediaRelativeAgainst.Tier}`}>
          All of tier {TIER_ROMAN_NUMERALS[tank.tier]}
        </SegmentedControl.Item>
        <SegmentedControl.Item value={`${TankopediaRelativeAgainst.All}`}>
          All tanks
        </SegmentedControl.Item>
      </SegmentedControl.Root>
    </Flex>
  );
}
