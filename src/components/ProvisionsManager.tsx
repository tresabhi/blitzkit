import { Flex } from '@radix-ui/themes';
import { ProvisionButton } from './ModuleButtons/ProvisionButton';

interface ProvisionsManagerProps {
  provisions: number[];
  selected: number[];
  disabled?: boolean;
  onChange?: (provisions: number[]) => void;
}

export function ProvisionsManager({
  provisions,
  selected,
  onChange,
  disabled,
}: ProvisionsManagerProps) {
  return (
    <Flex wrap="wrap">
      {provisions.map((provision, index) => {
        const isSelected = selected.includes(provision);

        return (
          <ProvisionButton
            key={provision}
            first={index === 0}
            last={index === provisions.length - 1}
            rowChild
            disabled={disabled && !isSelected}
            provision={provision}
            selected={isSelected}
            onClick={() => {
              if (!onChange) return;

              const draft = [...selected];

              if (isSelected) {
                draft.splice(draft.indexOf(provision), 1);
              } else {
                draft.push(provision);
              }

              onChange(draft);
            }}
          />
        );
      })}
    </Flex>
  );
}
