import { ContextMenu, DropdownMenu } from '@radix-ui/themes';
import mutateSession, { useSession } from '../../../../stores/session';

export type CustomColumnDisplay =
  | 'battles'
  | 'winrate'
  | 'wn8'
  | 'damage'
  | 'none';

const NO_DELTA: CustomColumnDisplay[] = ['battles', 'wn8', 'none'];

interface CustomColumn {
  Builder: typeof DropdownMenu | typeof ContextMenu;
  column: number;
}

export function CustomColumn({ column, Builder }: CustomColumn) {
  const customColumn = useSession((state) => state.customColumns[column]);

  return (
    <Builder.Sub>
      <Builder.SubTrigger>Column {column + 1}</Builder.SubTrigger>

      <Builder.SubContent>
        <Builder.Label>Display</Builder.Label>

        <Builder.RadioGroup
          value={customColumn.display}
          onValueChange={(event) =>
            mutateSession((draft) => {
              draft.customColumns[column].display =
                event as CustomColumnDisplay;
            })
          }
        >
          <Builder.RadioItem value="battles">Battles</Builder.RadioItem>
          <Builder.RadioItem value="winrate">Winrate</Builder.RadioItem>
          <Builder.RadioItem value="wn8">WN8</Builder.RadioItem>
          <Builder.RadioItem value="damage">Damage</Builder.RadioItem>
          <Builder.RadioItem value="none">None</Builder.RadioItem>
        </Builder.RadioGroup>

        {!NO_DELTA.includes(customColumn.display) && (
          <>
            <Builder.Separator />

            <Builder.CheckboxItem
              checked={customColumn.showDelta}
              onCheckedChange={(checked) =>
                mutateSession((draft) => {
                  draft.customColumns[column].showDelta = checked;
                })
              }
            >
              Show delta
            </Builder.CheckboxItem>
          </>
        )}
      </Builder.SubContent>
    </Builder.Sub>
  );
}
