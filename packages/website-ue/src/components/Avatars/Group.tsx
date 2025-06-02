import { type ProfileAvatarComponent } from '@protos/blitz_static_profile_avatar_component';
import type { SellableComponent } from '@protos/blitz_static_sellable_component';
import type { StuffUIComponent } from '@protos/blitz_static_stuff_ui_component';
import { Dialog } from '@radix-ui/themes';
import type { MaybeSkeletonComponentProps } from '../../types/maybeSkeletonComponentProps';
import { Content } from './Content';
import { Popup } from './Popup';

export interface AvatarGroupProps {
  name?: string;
  avatars: {
    stuff: StuffUIComponent;
    avatar: ProfileAvatarComponent;
    sellable?: SellableComponent;
  }[];
}

export function AvatarGroup(
  props: MaybeSkeletonComponentProps<AvatarGroupProps>,
) {
  if (props.skeleton) return <Content {...props} />;

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Content {...props} />
      </Dialog.Trigger>

      <Dialog.Content>
        <Popup {...props} />
      </Dialog.Content>
    </Dialog.Root>
  );
}
