import { DropdownMenu } from '@radix-ui/themes';
import mutateSession, { useSession } from '../../../../stores/session';

export type CustomColumnDisplay =
  | 'battles'
  | 'winrate'
  | 'wn8'
  | 'damage'
  | 'none';

const NO_DELTA: CustomColumnDisplay[] = ['battles', 'wn8', 'none'];

interface CustomColumn {
  column: number;
}

export function CustomColumn({ column }: CustomColumn) {
  const customColumn = useSession((state) => state.customColumns[column]);

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>Column {column + 1}</DropdownMenu.SubTrigger>

      <DropdownMenu.SubContent>
        <DropdownMenu.Label>Display</DropdownMenu.Label>

        <DropdownMenu.RadioGroup
          value={customColumn.display}
          onValueChange={(event) =>
            mutateSession((draft) => {
              draft.customColumns[column].display =
                event as CustomColumnDisplay;
            })
          }
        >
          <DropdownMenu.RadioItem value="battles">
            Battles
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="winrate">
            Winrate
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="wn8">WN8</DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="damage">Damage</DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="none">None</DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>

        {!NO_DELTA.includes(customColumn.display) && (
          <>
            <DropdownMenu.Separator />

            <DropdownMenu.CheckboxItem
              checked={customColumn.showDelta}
              onCheckedChange={(checked) =>
                mutateSession((draft) => {
                  draft.customColumns[column].showDelta = checked;
                })
              }
            >
              Show delta
            </DropdownMenu.CheckboxItem>
          </>
        )}
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
  );
}
