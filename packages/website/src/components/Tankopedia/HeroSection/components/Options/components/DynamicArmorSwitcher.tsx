import { asset } from '@blitzkit/core';
import { IconButton } from '@radix-ui/themes';
import { useArmor } from '../../../../../../hooks/useArmor';
import { Duel } from '../../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';

export function DynamicArmorSwitcher() {
  const tank = Duel.use((state) => state.protagonist.tank);
  const mutateDuel = Duel.useMutation();
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const isDynamicArmorActive = Duel.use((state) =>
    state.protagonist.consumables.includes(73),
  );
  const { hasDynamicArmor } = useArmor(tank.id);

  if (!hasDynamicArmor) return null;

  return (
    <IconButton
      color={isDynamicArmorActive ? undefined : 'gray'}
      variant="soft"
      size={{ initial: '2', sm: '3' }}
      onClick={() => {
        mutateDuel((draft) => {
          if (draft.protagonist.consumables.includes(73)) {
            draft.protagonist.consumables =
              draft.protagonist.consumables.filter((id) => id !== 73);
          } else {
            if (draft.protagonist.consumables.length === tank.max_consumables) {
              draft.protagonist.consumables[tank.max_consumables - 1] = 73;
            } else {
              draft.protagonist.consumables.push(73);
            }
          }
        });
        mutateTankopediaEphemeral((draft) => {
          draft.shot = undefined;
        });
      }}
    >
      <img
        alt="Dynamic Armor"
        src={asset('icons/consumables/73.webp')}
        style={{
          width: '50%',
          height: '50%',
        }}
      />
    </IconButton>
  );
}
