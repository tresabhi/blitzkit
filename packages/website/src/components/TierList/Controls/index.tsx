import { ReloadIcon } from '@radix-ui/react-icons';
import { Button, Flex } from '@radix-ui/themes';
import { TierList, tierListInitialState } from '../../../stores/tierList';
import { Share } from './components/Share';

export function TierListControls() {
  const mutateTierList = TierList.useMutation();

  return (
    <Flex justify="center" gap="2">
      <Button
        color="red"
        onClick={() => {
          mutateTierList((draft) => {
            Object.assign(draft, tierListInitialState);
          });
        }}
      >
        <ReloadIcon /> Reset
      </Button>

      <Share />
    </Flex>
  );
}
