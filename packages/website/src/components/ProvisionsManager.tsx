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
    <Flex wrap="wrap" gap="2" justify={{ initial: 'center', sm: 'start' }}>
      {provisions.map((provision) => {
        const isSelected = selected.includes(provision);

        return (
          <ProvisionButton
            key={provision}
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
