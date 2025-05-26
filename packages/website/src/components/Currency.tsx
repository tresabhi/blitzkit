import type { RewardCurrency } from '@protos/blitz_static_reward_currency';
import { Flex, Text, type TextProps } from '@radix-ui/themes';
import { entityName } from 'packages/core/src';
import { useLocale } from '../hooks/useLocale';

type CurrencyProps = TextProps & {
  reward: RewardCurrency;
};

export function Currency({ reward, ...props }: CurrencyProps) {
  const { locale } = useLocale();

  return (
    <Text {...props}>
      <Flex align="center" gap="1">
        {reward.amount.toLocaleString(locale)}
        <img
          src={`/api/currencies/${entityName(reward.currency_catalog_id)}.webp`}
        />
      </Flex>
    </Text>
  );
}
