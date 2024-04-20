import { Flex } from '@radix-ui/themes';
import { ConsumableEntry } from '../core/blitzkrieg/consumableDefinitions';
import { ConsumableButton } from './ModuleButtons/ConsumableButton';

interface ConsumablesManagerProps {
  consumables: ConsumableEntry[];
  selected: number[];
  onChange?: (consumables: number[]) => void;
  disabled?: boolean;
  timers?: boolean;
  hasHighEndConsumables?: boolean;
  hasConsumableDeliverySystem?: boolean;
  cooldownBooster?: number;
}

export function ConsumablesManager({
  consumables,
  selected,
  onChange,
  disabled,
  timers,
  hasConsumableDeliverySystem,
  cooldownBooster,
  hasHighEndConsumables,
}: ConsumablesManagerProps) {
  return (
    <Flex wrap="wrap">
      {consumables.map((consumable, index) => {
        const isSelected = selected.some((id) => id === consumable.id);

        return (
          <ConsumableButton
            special={consumable.duration === undefined}
            duration={
              timers
                ? consumable.duration === undefined
                  ? undefined
                  : consumable.duration * (hasHighEndConsumables ? 1.7 : 1)
                : undefined
            }
            cooldown={
              timers
                ? consumable.cooldown *
                  (hasConsumableDeliverySystem ? 0.85 : 1) *
                  (1 - cooldownBooster! * 0.1)
                : undefined
            }
            key={consumable.id}
            first={index === 0}
            last={index === consumables.length - 1}
            rowChild
            disabled={disabled && !isSelected}
            consumable={consumable.id}
            selected={isSelected}
            onClick={() => {
              if (!onChange) return;

              const draft = [...selected];

              if (draft.some((id) => id === consumable.id)) {
                draft.splice(draft.indexOf(consumable.id), 1);
              } else {
                draft.push(consumable.id);
              }

              onChange(draft);
            }}
          />
        );
      })}
    </Flex>
  );
}
