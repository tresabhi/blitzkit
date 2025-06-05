import type { StandardReward } from '@protos/blitz_static_standard_reward';
import { Badge, type BadgeProps } from '@radix-ui/themes';
import { useLocale } from '../hooks/useLocale';

interface RewardBadgeProps {
  reward: StandardReward;
}

export function RewardBadge({
  reward,
  ...props
}: RewardBadgeProps & BadgeProps) {
  const { locale } = useLocale();

  if (reward.reward_list.length !== 1) {
    throw new Error('reward_list must be length 1');
  }

  const reward0 = reward.reward_list[0];

  Object.entries(reward0).forEach(([key, value]) => {
    if (key !== 'currency_reward' && value !== undefined) {
      throw new Error(`unsupported reward type: ${key}`);
    }
  });

  return (
    <Badge {...props}>
      {reward0.currency_reward && (
        <>
          <img
            src={`/api/currencies/${reward0.currency_reward.currency_catalog_id.replace(
              'CurrencyEntity.',
              '',
            )}.webp`}
          />
          {reward0.currency_reward.amount.toLocaleString(locale)}
        </>
      )}
    </Badge>
  );
}
