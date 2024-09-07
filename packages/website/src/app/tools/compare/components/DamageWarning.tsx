import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Callout } from '@radix-ui/themes';
import * as CompareEphemeral from '../../../../stores/compareEphemeral';

export function DamageWarning() {
  const members = CompareEphemeral.use((state) => state.members);
  const hasReactive = members.some((member) => member.consumables.includes(33));
  const haDynamicArmor = members.some((member) =>
    member.consumables.includes(73),
  );
  const hasSpallLiner = members.some((member) =>
    member.provisions.includes(101),
  );

  if (!hasReactive && !haDynamicArmor && !hasSpallLiner) return null;

  {
    <Callout.Root>
      <Callout.Icon>
        <InfoCircledIcon />
      </Callout.Icon>
      <Callout.Text>
        Consumables like Reactive Armor and Dynamic Armor System and provisions
        like Spall Liner may reduce other tanks' damage.
      </Callout.Text>
    </Callout.Root>;
  }
}
