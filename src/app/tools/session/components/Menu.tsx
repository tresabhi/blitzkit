import { ContextMenu, DropdownMenu, Flex } from '@radix-ui/themes';
import { createColors } from 'bepaint';
import { useState } from 'react';
import {
  ACCENT_COLORS,
  AccentColor,
  GRAY_COLORS,
  GrayColor,
  PALETTES,
} from '../../../../constants/radixColors';
import { useSession } from '../../../../stores/session';
import { CustomColumn } from './CustomColumn';

interface ContextMenuProps {
  Builder: typeof DropdownMenu | typeof ContextMenu;
  reset: () => void;
}

export function Menu({ Builder, reset }: ContextMenuProps) {
  const session = useSession();
  const [showTitleEditor, setShowTitleEditor] = useState(false);

  return (
    <Builder.Content>
      <Builder.Sub>
        <Builder.SubTrigger>Accent color</Builder.SubTrigger>

        <Builder.SubContent>
          <Builder.RadioGroup
            value={session.color}
            onValueChange={(value) =>
              useSession.setState({ color: value as AccentColor | GrayColor })
            }
          >
            {[...ACCENT_COLORS, ...GRAY_COLORS].map((color) => (
              <Builder.RadioItem value={color} key={color}>
                <Flex gap="2" align="center">
                  <div
                    style={{
                      backgroundColor: createColors(PALETTES[color])
                        .solidBackground,
                      width: 16,
                      height: 16,
                      borderRadius: '100%',
                    }}
                  />
                  {`${color.charAt(0).toUpperCase()}${color.slice(1)}`}
                </Flex>
              </Builder.RadioItem>
            ))}
          </Builder.RadioGroup>
        </Builder.SubContent>
      </Builder.Sub>

      <Builder.Separator />

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
