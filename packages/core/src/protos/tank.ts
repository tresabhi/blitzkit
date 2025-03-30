// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.2.2
//   protoc               v5.28.2
// source: packages/core/src/protos/tank.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { I18n, createBaseI18n } from "./utils";

export const protobufPackage = "blitzkit";

export interface Tank {
  id: string;
  slug: string;
  name: I18n;
  turrets: { [key: string]: Turret };
  guns: { [key: string]: Gun };
}

export interface Tank_TurretsEntry {
  key: string;
  value: Turret | undefined;
}

export interface Tank_GunsEntry {
  key: string;
  value: Gun | undefined;
}

export interface Turret {
  id: string;
}

export interface Gun {
  id: string;
}

function createBaseTank(): Tank {
  return { id: "", slug: "", name: createBaseI18n(), turrets: {}, guns: {} };
}

export const Tank: MessageFns<Tank> = {
  encode(message: Tank, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.slug !== "") {
      writer.uint32(18).string(message.slug);
    }
    if (message.name !== undefined) {
      I18n.encode(message.name, writer.uint32(26).fork()).join();
    }
    Object.entries(message.turrets).forEach(([key, value]) => {
      Tank_TurretsEntry.encode({ key: key as any, value }, writer.uint32(34).fork()).join();
    });
    Object.entries(message.guns).forEach(([key, value]) => {
      Tank_GunsEntry.encode({ key: key as any, value }, writer.uint32(42).fork()).join();
    });
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): Tank {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTank();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.slug = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.name = I18n.decode(reader, reader.uint32());
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          const entry4 = Tank_TurretsEntry.decode(reader, reader.uint32());
          if (entry4.value !== undefined) {
            message.turrets[entry4.key] = entry4.value;
          }
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }

          const entry5 = Tank_GunsEntry.decode(reader, reader.uint32());
          if (entry5.value !== undefined) {
            message.guns[entry5.key] = entry5.value;
          }
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Tank {
    return {
      id: globalThis.String(assertSet("Tank.id", object.id)),
      slug: globalThis.String(assertSet("Tank.slug", object.slug)),
      name: I18n.fromJSON(assertSet("Tank.name", object.name)),
      turrets: isObject(object.turrets)
        ? Object.entries(object.turrets).reduce<{ [key: string]: Turret }>((acc, [key, value]) => {
          acc[key] = Turret.fromJSON(value);
          return acc;
        }, {})
        : {},
      guns: isObject(object.guns)
        ? Object.entries(object.guns).reduce<{ [key: string]: Gun }>((acc, [key, value]) => {
          acc[key] = Gun.fromJSON(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: Tank): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.slug !== "") {
      obj.slug = message.slug;
    }
    if (message.name !== undefined) {
      obj.name = I18n.toJSON(message.name);
    }
    if (message.turrets) {
      const entries = Object.entries(message.turrets);
      if (entries.length > 0) {
        obj.turrets = {};
        entries.forEach(([k, v]) => {
          obj.turrets[k] = Turret.toJSON(v);
        });
      }
    }
    if (message.guns) {
      const entries = Object.entries(message.guns);
      if (entries.length > 0) {
        obj.guns = {};
        entries.forEach(([k, v]) => {
          obj.guns[k] = Gun.toJSON(v);
        });
      }
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Tank>, I>>(base?: I): Tank {
    return Tank.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Tank>, I>>(object: I): Tank {
    const message = createBaseTank();
    message.id = object.id ?? "";
    message.slug = object.slug ?? "";
    message.name = (object.name !== undefined && object.name !== null)
      ? I18n.fromPartial(object.name)
      : createBaseI18n();
    message.turrets = Object.entries(object.turrets ?? {}).reduce<{ [key: string]: Turret }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = Turret.fromPartial(value);
      }
      return acc;
    }, {});
    message.guns = Object.entries(object.guns ?? {}).reduce<{ [key: string]: Gun }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = Gun.fromPartial(value);
      }
      return acc;
    }, {});
    return message;
  },
};

function createBaseTank_TurretsEntry(): Tank_TurretsEntry {
  return { key: "", value: createBaseTurret() };
}

export const Tank_TurretsEntry: MessageFns<Tank_TurretsEntry> = {
  encode(message: Tank_TurretsEntry, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.key !== undefined) {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      Turret.encode(message.value, writer.uint32(18).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): Tank_TurretsEntry {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTank_TurretsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.value = Turret.decode(reader, reader.uint32());
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Tank_TurretsEntry {
    return {
      key: globalThis.String(assertSet("Tank_TurretsEntry.key", object.key)),
      value: Turret.fromJSON(assertSet("Tank_TurretsEntry.value", object.value)),
    };
  },

  toJSON(message: Tank_TurretsEntry): unknown {
    const obj: any = {};
    if (message.key !== undefined) {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = Turret.toJSON(message.value);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Tank_TurretsEntry>, I>>(base?: I): Tank_TurretsEntry {
    return Tank_TurretsEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Tank_TurretsEntry>, I>>(object: I): Tank_TurretsEntry {
    const message = createBaseTank_TurretsEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null)
      ? Turret.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseTank_GunsEntry(): Tank_GunsEntry {
  return { key: "", value: createBaseGun() };
}

export const Tank_GunsEntry: MessageFns<Tank_GunsEntry> = {
  encode(message: Tank_GunsEntry, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.key !== undefined) {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      Gun.encode(message.value, writer.uint32(18).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): Tank_GunsEntry {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTank_GunsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.value = Gun.decode(reader, reader.uint32());
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Tank_GunsEntry {
    return {
      key: globalThis.String(assertSet("Tank_GunsEntry.key", object.key)),
      value: Gun.fromJSON(assertSet("Tank_GunsEntry.value", object.value)),
    };
  },

  toJSON(message: Tank_GunsEntry): unknown {
    const obj: any = {};
    if (message.key !== undefined) {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = Gun.toJSON(message.value);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Tank_GunsEntry>, I>>(base?: I): Tank_GunsEntry {
    return Tank_GunsEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Tank_GunsEntry>, I>>(object: I): Tank_GunsEntry {
    const message = createBaseTank_GunsEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null) ? Gun.fromPartial(object.value) : undefined;
    return message;
  },
};

function createBaseTurret(): Turret {
  return { id: "" };
}

export const Turret: MessageFns<Turret> = {
  encode(message: Turret, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): Turret {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTurret();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Turret {
    return { id: globalThis.String(assertSet("Turret.id", object.id)) };
  },

  toJSON(message: Turret): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Turret>, I>>(base?: I): Turret {
    return Turret.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Turret>, I>>(object: I): Turret {
    const message = createBaseTurret();
    message.id = object.id ?? "";
    return message;
  },
};

function createBaseGun(): Gun {
  return { id: "" };
}

export const Gun: MessageFns<Gun> = {
  encode(message: Gun, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): Gun {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGun();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Gun {
    return { id: globalThis.String(assertSet("Gun.id", object.id)) };
  },

  toJSON(message: Gun): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Gun>, I>>(base?: I): Gun {
    return Gun.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Gun>, I>>(object: I): Gun {
    const message = createBaseGun();
    message.id = object.id ?? "";
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string; value: unknown } ? { $case: T["$case"]; value?: DeepPartial<T["value"]> }
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

function assertSet<T>(field: string, value: T | undefined): T {
  if (!isSet(value)) {
    throw new TypeError(`Required field ${field} is not set`);
  }

  return value as T;
}

export interface MessageFns<T> {
  encode(message: T, writer?: BinaryWriter): BinaryWriter;
  decode(input: BinaryReader | Uint8Array, length?: number): T;
  fromJSON(object: any): T;
  toJSON(message: T): unknown;
  create<I extends Exact<DeepPartial<T>, I>>(base?: I): T;
  fromPartial<I extends Exact<DeepPartial<T>, I>>(object: I): T;
}
