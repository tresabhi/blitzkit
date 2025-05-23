// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.2.2
//   protoc               v5.28.2
// source: packages/core/src/protos/gallery.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { createBaseI18nString, I18nString } from "./i18n";

export const protobufPackage = "blitzkit";

export interface Gallery {
  avatars: Avatar[];
}

export interface Avatar {
  id: string;
  name: I18nString;
  extension: string;
}

export function createBaseGallery(): Gallery {
  return { avatars: [] };
}

export const Gallery: MessageFns<Gallery> = {
  encode(message: Gallery, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    for (const v of message.avatars) {
      Avatar.encode(v!, writer.uint32(10).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): Gallery {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGallery();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.avatars.push(Avatar.decode(reader, reader.uint32()));
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

  fromJSON(object: any): Gallery {
    return {
      avatars: globalThis.Array.isArray(object?.avatars) ? object.avatars.map((e: any) => Avatar.fromJSON(e)) : [],
    };
  },

  toJSON(message: Gallery): unknown {
    const obj: any = {};
    if (message.avatars?.length) {
      obj.avatars = message.avatars.map((e) => Avatar.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Gallery>, I>>(base?: I): Gallery {
    return Gallery.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Gallery>, I>>(object: I): Gallery {
    const message = createBaseGallery();
    message.avatars = object.avatars?.map((e) => Avatar.fromPartial(e)) || [];
    return message;
  },
};

export function createBaseAvatar(): Avatar {
  return { id: "", name: createBaseI18nString(), extension: "" };
}

export const Avatar: MessageFns<Avatar> = {
  encode(message: Avatar, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== undefined) {
      I18nString.encode(message.name, writer.uint32(18).fork()).join();
    }
    if (message.extension !== "") {
      writer.uint32(26).string(message.extension);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): Avatar {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAvatar();
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

          message.name = I18nString.decode(reader, reader.uint32());
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.extension = reader.string();
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

  fromJSON(object: any): Avatar {
    return {
      id: globalThis.String(assertSet("Avatar.id", object.id)),
      name: I18nString.fromJSON(assertSet("Avatar.name", object.name)),
      extension: globalThis.String(assertSet("Avatar.extension", object.extension)),
    };
  },

  toJSON(message: Avatar): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.name !== undefined) {
      obj.name = I18nString.toJSON(message.name);
    }
    if (message.extension !== "") {
      obj.extension = message.extension;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Avatar>, I>>(base?: I): Avatar {
    return Avatar.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Avatar>, I>>(object: I): Avatar {
    const message = createBaseAvatar();
    message.id = object.id ?? "";
    message.name = (object.name !== undefined && object.name !== null)
      ? I18nString.fromPartial(object.name)
      : createBaseI18nString();
    message.extension = object.extension ?? "";
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
