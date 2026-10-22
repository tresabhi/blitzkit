import type { Node, Scene } from "@gltf-transform/core";

export function addExtras(property: Node | Scene, extras: object) {
  property.setExtras({ ...property.getExtras(), ...extras });
}

/** glTF extras must be plain JSON; sc2 data holds bigints */
export function toExtras(value: unknown) {
  return JSON.parse(
    JSON.stringify(value, (_, item) =>
      typeof item === "bigint"
        ? Number(item)
        : item instanceof ArrayBuffer
          ? undefined
          : item,
    ),
  );
}
