import { ReloadIcon } from '@radix-ui/react-icons';
import { Button, Flex } from '@radix-ui/themes';
import { useLocale } from '../../../hooks/useLocale';
import { TierList, tierListInitialState } from '../../../stores/tierList';
import { Share } from './components/Share';

export function TierListControls() {
  const mutateTierList = TierList.useMutation();
  const { strings } = useLocale();

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
        <ReloadIcon /> {strings.website.tools.tier_list.buttons.reset}
      </Button>

      <Share />
    </Flex>
  );
}
