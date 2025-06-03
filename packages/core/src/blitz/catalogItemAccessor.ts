import { CatalogItem } from '@protos/blitz_items';
import { Any } from '@protos/google/protobuf/any';
import { lowerFirst } from 'lodash-es';
import { MessageFns } from '../protos';

export class CatalogItemAccessor {
  public id: string;
  components: Record<string, Any> = {};

  constructor(item: CatalogItem) {
    this.id = item.catalog_id;

    for (const component of item.components) {
      if (
        component.value === undefined ||
        component.value.component === undefined
      ) {
        continue;
      }

      this.components[component.key] = component.value.component;
    }
  }

  undiscriminatedId() {
    return this.id.split('.').slice(1).join('.');
  }

  static fromComponent(id: string, component: Any) {
    return this.fromComponents(id, [component]);
  }

  static fromComponents(id: string, components: Any[]) {
    return new CatalogItemAccessor({
      catalog_id: id,
      components: components.map((component) => ({
        key: lowerFirst(
          component.type_url.slice(2).split('.').slice(1).join('.'),
        ),
        value: { type_url: component.type_url, component },
      })),
    });
  }

  addComponent(key: string, value: Any) {
    this.components[key] = value;
    return this;
  }

  getOptional<Type>(Message: MessageFns<Type>, component: string) {
    if (component in this.components) {
      return Message.decode(this.components[component].value);
    }
  }

  get<Type>(Message: MessageFns<Type>, component: string) {
    const value = this.getOptional(Message, component);
    if (value === undefined) throw new Error(`Unknown component: ${component}`);
    return value;
  }

  pack() {
    const item: CatalogItem = { catalog_id: this.id, components: [] };

    for (const componentId in this.components) {
      const component = this.components[componentId];

      item.components.push({
        key: componentId,
        value: { type_url: component.type_url, component },
      });
    }

    return item;
  }

  encode() {
    return CatalogItem.encode(this.pack()).finish();
  }
}
