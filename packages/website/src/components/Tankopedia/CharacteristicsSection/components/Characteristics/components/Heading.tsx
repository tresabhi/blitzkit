import { TIER_ROMAN_NUMERALS } from '@blitzkit/core';
import { Flex, Heading, SegmentedControl, Text } from '@radix-ui/themes';
import { literals } from '../../../../../../core/i18n/literals';
import { useLocale } from '../../../../../../hooks/useLocale';
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
  const { strings } = useLocale();

  return (
    <Flex
      align={{ initial: 'stretch', md: 'start' }}
      gap="2"
      direction="column"
    >
      <Heading mb="2">
        {strings.website.tools.tankopedia.characteristics.title}
      </Heading>

      <Text color="gray">
        {strings.website.tools.tankopedia.characteristics.compare.label}
      </Text>
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
          {literals(
            strings.website.tools.tankopedia.characteristics.compare.class,
            [
              TIER_ROMAN_NUMERALS[tank.tier],
              strings.common.tank_class_short_plural_lowercase[tank.class],
            ],
          )}
        </SegmentedControl.Item>
        <SegmentedControl.Item value={`${TankopediaRelativeAgainst.Tier}`}>
          {literals(
            strings.website.tools.tankopedia.characteristics.compare.tier,
            [TIER_ROMAN_NUMERALS[tank.tier]],
          )}
        </SegmentedControl.Item>
        <SegmentedControl.Item value={`${TankopediaRelativeAgainst.All}`}>
          {strings.website.tools.tankopedia.characteristics.compare.all}
        </SegmentedControl.Item>
      </SegmentedControl.Root>
    </Flex>
  );
}
