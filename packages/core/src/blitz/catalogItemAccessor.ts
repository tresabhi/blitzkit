import { CatalogItem } from '@protos/blitz_items';
import { Any } from '@protos/google/protobuf/any';
import { MessageFns } from '../protos';

export class CatalogItemAccessor {
  public id: string;
  private components: Record<string, Any> = {};

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

  addComponent(key: string, value: Any) {
    this.components[key] = value;
    return this;
  }

  get<Type>(Message: MessageFns<Type>, component: string) {
    if (component in this.components) {
      return Message.decode(this.components[component].value);
    }

    throw new Error(`Unknown component: ${component}`);
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
}
