import { Share2Icon } from '@radix-ui/react-icons';
import { useRef } from 'react';
import { generateTierListParams } from '../../../../core/blitzkit/generateTierListParams';
import { TierList } from '../../../../stores/tierList';
import { CopyButton } from '../../../CopyButton';

export function Share() {
  const tanks = TierList.use((state) => state.tanks);
  const input = useRef<HTMLInputElement>(null);

  return (
    <CopyButton
      variant="outline"
      copy={() =>
        `${location.origin}/tools/tier-list?${generateTierListParams(tanks)}`
      }
    >
      <Share2Icon /> Share
    </CopyButton>
  );
}
