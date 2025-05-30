// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.2.2
//   protoc               v5.28.2
// source: packages/core/src/protos/skill_definitions.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";

export const protobufPackage = "blitzkit";

export interface SkillDefinitions {
  /** enums are disallowed as keys so using uint32; convert run-time */
  classes: { [key: number]: Skill };
}

export interface SkillDefinitions_ClassesEntry {
  key: number;
  value: Skill | undefined;
}

export interface Skill {
  skills: string[];
}

export function createBaseSkillDefinitions(): SkillDefinitions {
  return { classes: {} };
}

export const SkillDefinitions: MessageFns<SkillDefinitions> = {
  encode(message: SkillDefinitions, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    Object.entries(message.classes).forEach(([key, value]) => {
      SkillDefinitions_ClassesEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).join();
    });
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): SkillDefinitions {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSkillDefinitions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          const entry1 = SkillDefinitions_ClassesEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.classes[entry1.key] = entry1.value;
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

  fromJSON(object: any): SkillDefinitions {
    return {
      classes: isObject(object.classes)
        ? Object.entries(object.classes).reduce<{ [key: number]: Skill }>((acc, [key, value]) => {
          acc[globalThis.Number(key)] = Skill.fromJSON(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: SkillDefinitions): unknown {
    const obj: any = {};
    if (message.classes) {
      const entries = Object.entries(message.classes);
      if (entries.length > 0) {
        obj.classes = {};
        entries.forEach(([k, v]) => {
          obj.classes[k] = Skill.toJSON(v);
        });
      }
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<SkillDefinitions>, I>>(base?: I): SkillDefinitions {
    return SkillDefinitions.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<SkillDefinitions>, I>>(object: I): SkillDefinitions {
    const message = createBaseSkillDefinitions();
    message.classes = Object.entries(object.classes ?? {}).reduce<{ [key: number]: Skill }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[globalThis.Number(key)] = Skill.fromPartial(value);
      }
      return acc;
    }, {});
    return message;
  },
};

export function createBaseSkillDefinitions_ClassesEntry(): SkillDefinitions_ClassesEntry {
  return { key: 0, value: createBaseSkill() };
}

export const SkillDefinitions_ClassesEntry: MessageFns<SkillDefinitions_ClassesEntry> = {
  encode(message: SkillDefinitions_ClassesEntry, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.key !== undefined) {
      writer.uint32(8).uint32(message.key);
    }
    if (message.value !== undefined) {
      Skill.encode(message.value, writer.uint32(18).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): SkillDefinitions_ClassesEntry {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSkillDefinitions_ClassesEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.key = reader.uint32();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.value = Skill.decode(reader, reader.uint32());
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

  fromJSON(object: any): SkillDefinitions_ClassesEntry {
    return {
      key: globalThis.Number(assertSet("SkillDefinitions_ClassesEntry.key", object.key)),
      value: Skill.fromJSON(assertSet("SkillDefinitions_ClassesEntry.value", object.value)),
    };
  },

  toJSON(message: SkillDefinitions_ClassesEntry): unknown {
    const obj: any = {};
    if (message.key !== undefined) {
      obj.key = Math.round(message.key);
    }
    if (message.value !== undefined) {
      obj.value = Skill.toJSON(message.value);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<SkillDefinitions_ClassesEntry>, I>>(base?: I): SkillDefinitions_ClassesEntry {
    return SkillDefinitions_ClassesEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<SkillDefinitions_ClassesEntry>, I>>(
    object: I,
  ): SkillDefinitions_ClassesEntry {
    const message = createBaseSkillDefinitions_ClassesEntry();
    message.key = object.key ?? 0;
    message.value = (object.value !== undefined && object.value !== null)
      ? Skill.fromPartial(object.value)
      : createBaseSkill();
    return message;
  },
};

export function createBaseSkill(): Skill {
  return { skills: [] };
}

export const Skill: MessageFns<Skill> = {
  encode(message: Skill, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    for (const v of message.skills) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): Skill {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSkill();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.skills.push(reader.string());
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

  fromJSON(object: any): Skill {
    return {
      skills: globalThis.Array.isArray(object?.skills) ? object.skills.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: Skill): unknown {
    const obj: any = {};
    if (message.skills?.length) {
      obj.skills = message.skills;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Skill>, I>>(base?: I): Skill {
    return Skill.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Skill>, I>>(object: I): Skill {
    const message = createBaseSkill();
    message.skills = object.skills?.map((e) => e) || [];
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
