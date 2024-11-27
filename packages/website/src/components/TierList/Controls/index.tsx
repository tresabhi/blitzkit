import { ReloadIcon } from '@radix-ui/react-icons';
import { Button, Flex } from '@radix-ui/themes';
import { TierList } from '../../../stores/tierList';
import { tierListRows } from '../Table/constants';
import { Share } from './components/Share';

export function TierListControls() {
  const mutateTierList = TierList.useMutation();

  return (
    <Flex justify="center" gap="2">
      <Button
        color="red"
        onClick={() => {
          mutateTierList((draft) => {
            draft.tanks = tierListRows.map(() => []);
          });
        }}
      >
        <ReloadIcon /> Reset
      </Button>

      <Share />
    </Flex>
  );
}
