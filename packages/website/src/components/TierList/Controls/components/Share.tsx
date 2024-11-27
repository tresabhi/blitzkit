import { Share2Icon } from '@radix-ui/react-icons';
import { generateTierListParams } from '../../../../core/blitzkit/generateTierListParams';
import { TierList } from '../../../../stores/tierList';
import { CopyButton } from '../../../CopyButton';

export function Share() {
  const rows = TierList.use((state) => state.rows);

  return (
    <CopyButton
      variant="outline"
      copy={() =>
        `${location.origin}/tools/tier-list?${generateTierListParams(rows)}`
      }
    >
      <Share2Icon /> Share
    </CopyButton>
  );
}
