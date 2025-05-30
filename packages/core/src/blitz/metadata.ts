import { BlitzkitAllAvatarsComponent } from '@protos/blitzkit_static_all_avatars_component';
import { CatalogItemAccessor } from './catalogItemAccessor';

export abstract class MetadataAccessor {
  abstract get(item: string): Promise<CatalogItemAccessor>;

  abstract add(item: CatalogItemAccessor): void;

  abstract filter(predicate: (item: string) => boolean): CatalogItemAccessor[];

  injectBlitzkit() {
    this.injectBlitzkitProfileAvatars();

    return this;
  }

  injectBlitzkitProfileAvatars() {
    const allAvatars: BlitzkitAllAvatarsComponent = {
      avatars: this.filter((item) =>
        item.startsWith('ProfileAvatarEntity.'),
      ).map((avatar) => avatar.pack()),
    };

    this.add(
      CatalogItemAccessor.fromComponent(
        'BlitzkitAllAvatarsEntity.blitzkit_all_avatars',
        {
          type_url:
            './blitzkit_static_all_avatars_component.BlitzkitAllAvatarsComponent',
          value: BlitzkitAllAvatarsComponent.encode(allAvatars).finish(),
        },
      ),
    );
  }
}
