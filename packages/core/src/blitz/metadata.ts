import { CatalogItem } from '@protos/blitz_items';
import { Metadata } from '@protos/blitz_metadata';
import { LocalizationResourcesComponent } from '@protos/blitz_static_localization_resources_component';
import { RemoteStorageComponent } from '@protos/blitz_static_remote_storage_component';
import { load } from 'js-yaml';
import { minimatch } from 'minimatch';
import { CatalogItemAccessor } from 'packages/core/src/blitz/catalogItemAccessor';

interface LocalizationConfig {
  namespaces: string[];
}

export class MetadataAccessor {
  items: Record<string, CatalogItem> = {};

  constructor(metadata: Metadata) {
    for (const item of metadata.catalog_items) {
      this.items[item.catalog_id] = item;
    }
  }

  get(item: string) {
    if (item in this.items) return new CatalogItemAccessor(this.items[item]);
    throw new Error(`Item ${item} does not exist in socket metadata`);
  }

  add(item: CatalogItemAccessor) {
    this.items[item.id] = item.pack();
  }

  filter(predicate: (item: string) => boolean) {
    const items: CatalogItemAccessor[] = [];

    for (const item in this.items) {
      if (predicate(item)) {
        items.push(new CatalogItemAccessor(this.items[item]));
      }
    }

    return items;
  }

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

  toArray() {
    return Object.values(this.items);
  }

  toSortedArray() {
    return this.toArray().sort((a, b) =>
      a.catalog_id.localeCompare(b.catalog_id),
    );
  }
}
