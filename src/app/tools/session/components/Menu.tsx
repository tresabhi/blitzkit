import { ContextMenu, DropdownMenu } from '@radix-ui/themes';
import { useSession } from '../../../../stores/session';
import { CustomColumn } from './CustomColumn';

interface ContextMenuProps {
  Builder: typeof DropdownMenu | typeof ContextMenu;
  reset: () => void;
}

export function Menu({ Builder, reset }: ContextMenuProps) {
  const session = useSession();

  return (
    <Builder.Content>
      <CustomColumn Builder={Builder} column={0} />
      <CustomColumn Builder={Builder} column={1} />
      <CustomColumn Builder={Builder} column={2} />
      <CustomColumn Builder={Builder} column={3} />

      <Builder.Separator />

      <Builder.CheckboxItem
        checked={session.showTotal}
        onCheckedChange={(checked) =>
          useSession.setState({ showTotal: checked })
        }
      >
        Show total
      </Builder.CheckboxItem>
      <Builder.CheckboxItem
        checked={session.showCareer}
        onCheckedChange={(checked) =>
          useSession.setState({ showCareer: checked })
        }
      >
        Show career
      </Builder.CheckboxItem>

      <Builder.Separator />

      <Builder.Item color="red" onClick={reset}>
        Reset
      </Builder.Item>
    </Builder.Content>
  );
}
