import type { BlitzKitAvatar } from '@protos/blitzkit';
import { Dialog } from '@radix-ui/themes';
import type { MaybeSkeletonComponentProps } from '../../types/maybeSkeletonComponentProps';
import { Content } from './Content';
import { Popup } from './Popup';

export interface AvatarGroupProps {
  name?: string;
  avatars: { avatar: BlitzKitAvatar }[];
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
