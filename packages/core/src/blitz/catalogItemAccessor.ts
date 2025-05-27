import { CatalogItem } from '@protos/blitz_items';
import { Any } from '@protos/google/protobuf/any';
import { MessageFns } from '../protos';

export class CatalogItemAccessor {
  private components: Record<string, Any> = {};

  constructor(item: CatalogItem) {
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

  get<Type>(Message: MessageFns<Type>, component: string) {
    if (component in this.components) {
      return Message.decode(this.components[component].value);
    }

    throw new Error(`Unknown component: ${component}`);
  }
}
