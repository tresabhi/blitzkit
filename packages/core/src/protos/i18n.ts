// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.2.2
//   protoc               v5.28.2
// source: packages/core/src/protos/i18n.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";

export const protobufPackage = "blitzkit";

export interface I18nString {
  locales: { [key: string]: string };
}

export interface I18nString_LocalesEntry {
  key: string;
  value: string;
}

export function createBaseI18nString(): I18nString {
  return { locales: {} };
}

export const I18nString: MessageFns<I18nString> = {
  encode(message: I18nString, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    Object.entries(message.locales).forEach(([key, value]) => {
      I18nString_LocalesEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).join();
    });
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): I18nString {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseI18nString();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          const entry1 = I18nString_LocalesEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.locales[entry1.key] = entry1.value;
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

  fromJSON(object: any): I18nString {
    return {
      locales: isObject(object.locales)
        ? Object.entries(object.locales).reduce<{ [key: string]: string }>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: I18nString): unknown {
    const obj: any = {};
    if (message.locales) {
      const entries = Object.entries(message.locales);
      if (entries.length > 0) {
        obj.locales = {};
        entries.forEach(([k, v]) => {
          obj.locales[k] = v;
        });
      }
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<I18nString>, I>>(base?: I): I18nString {
    return I18nString.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<I18nString>, I>>(object: I): I18nString {
    const message = createBaseI18nString();
    message.locales = Object.entries(object.locales ?? {}).reduce<{ [key: string]: string }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    return message;
  },
};

export function createBaseI18nString_LocalesEntry(): I18nString_LocalesEntry {
  return { key: "", value: "" };
}

export const I18nString_LocalesEntry: MessageFns<I18nString_LocalesEntry> = {
  encode(message: I18nString_LocalesEntry, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.key !== undefined) {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): I18nString_LocalesEntry {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseI18nString_LocalesEntry();
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

          message.value = reader.string();
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

  fromJSON(object: any): I18nString_LocalesEntry {
    return {
      key: globalThis.String(assertSet("I18nString_LocalesEntry.key", object.key)),
      value: globalThis.String(assertSet("I18nString_LocalesEntry.value", object.value)),
    };
  },

  toJSON(message: I18nString_LocalesEntry): unknown {
    const obj: any = {};
    if (message.key !== undefined) {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = message.value;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<I18nString_LocalesEntry>, I>>(base?: I): I18nString_LocalesEntry {
    return I18nString_LocalesEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<I18nString_LocalesEntry>, I>>(object: I): I18nString_LocalesEntry {
    const message = createBaseI18nString_LocalesEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
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
