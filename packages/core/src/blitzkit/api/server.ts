import { ProfileAvatarComponent } from '@protos/blitz_static_profile_avatar_component';
import { SellableComponent } from '@protos/blitz_static_sellable_component';
import { StuffUIComponent } from '@protos/blitz_static_stuff_ui_component';
import { BlitzKitAvatars } from '@protos/blitzkit';
import { BlitzkitAPI } from '.';
import { MetadataAccessor } from '../../blitz/metadata';

export class BlitzkitServerAPI extends BlitzkitAPI {
  constructor(public metadata: MetadataAccessor) {
    super();
  }

  async avatars() {
    const avatars: BlitzKitAvatars = { avatars: [] };

    for (const item of this.metadata.filter((item) =>
      item.startsWith('ProfileAvatarEntity.'),
    )) {
      const stuff = item.get(StuffUIComponent, 'UIComponent');
      const avatar = item.get(ProfileAvatarComponent, 'profileAvatarComponent');
      const sellable = item.getOptional(SellableComponent, 'sellableComponent');

      avatars.avatars.push({
        id: item.undiscriminatedId(),
        name: stuff.display_name,
        obtaining: stuff.obtaining_methods,
        description: stuff.description,
        grade: stuff.grade,
        category: avatar.category,
        hidden_if_not_obtained: avatar.hidden_if_not_obtained,
        sale: sellable?.reward,
      });
    }

    return avatars;
  }
}
