import { LocalizationResourcesComponent } from '@protos/blitz_static_localization_resources_component';
import { ProfileAvatarComponent } from '@protos/blitz_static_profile_avatar_component';
import { RemoteStorageComponent } from '@protos/blitz_static_remote_storage_component';
import { SellableComponent } from '@protos/blitz_static_sellable_component';
import { StuffUIComponent } from '@protos/blitz_static_stuff_ui_component';
import { BlitzkitAllAvatarsComponent } from '@protos/blitzkit_static_all_avatars_component';
import { load } from 'js-yaml';
import { minimatch } from 'minimatch';
import { CatalogItemAccessor } from 'packages/core/src/blitz/catalogItemAccessor';

interface LocalizationConfig {
  namespaces: string[];
}

export abstract class MetadataAccessor {
  abstract get(item: string): Promise<CatalogItemAccessor>;

  abstract add(item: CatalogItemAccessor): void;

  abstract filter(predicate: (item: string) => boolean): CatalogItemAccessor[];

  async strings(locale: string) {
    const clientConfig = await this.get(
      'ClientConfigsEntity.default_client_config',
    );
    const localizationResources = clientConfig.get(
      LocalizationResourcesComponent,
      'localizationResourcesComponent',
    );

    if (!localizationResources.remote_storage) {
      throw new Error('Localization resources not found');
    }

    const { relative_path } = localizationResources.remote_storage;

    let remoteStorage: RemoteStorageComponent | undefined = undefined;

    for (const candidateId of localizationResources.remote_storage.production) {
      const item = await this.get(candidateId);
      const candidate = item.get(
        RemoteStorageComponent,
        'remoteStorageComponent',
      );

      if (
        remoteStorage === undefined ||
        candidate.download_speed_weight > remoteStorage.download_speed_weight
      ) {
        remoteStorage = candidate;
      }
    }

    if (remoteStorage === undefined) {
      throw new Error('No suitable production remote storage found');
    }

    const config = await fetch(
      `${remoteStorage.url}/${relative_path}/config.yaml`,
    )
      .then((response) => response.text())
      .then((text) => load(text) as LocalizationConfig);
    const strings: Record<string, string> = {};

    for (const namespace of config.namespaces) {
      Object.assign(
        strings,
        await fetch(
          `${remoteStorage.url}/${relative_path}/${namespace}/${locale}.yaml`,
        )
          .then((response) => response.text())
          .then((text) => {
            const strings: Record<string, string> = {};
            const parsed = load(text) as Record<string, string>;

            for (const key in parsed) {
              strings[key] = parsed[key].replaceAll('\\"', '"');
            }

            return strings;
          }),
      );
    }

    return strings;
  }

  async stringsPartial(locale: string, patterns: string[]) {
    const strings = await this.strings(locale);
    const filtered: Record<string, string> = {};

    for (const key in strings) {
      if (patterns.some((pattern) => minimatch(key, pattern))) {
        filtered[key] = strings[key];
      }
    }

    return filtered;
  }

  injectBlitzkit() {
    this.injectBlitzkitProfileAvatars();

    return this;
  }

  injectBlitzkitProfileAvatars() {
    const allAvatars: BlitzkitAllAvatarsComponent = { avatars: [] };

    for (const item of this.filter((item) =>
      item.startsWith('ProfileAvatarEntity.'),
    )) {
      const stuff = item.get(StuffUIComponent, 'UIComponent');
      const avatar = item.get(ProfileAvatarComponent, 'profileAvatarComponent');
      const sellable = item.getOptional(SellableComponent, 'sellableComponent');

      allAvatars.avatars.push({
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
