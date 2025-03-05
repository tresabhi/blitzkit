// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.2.2
//   protoc               v5.28.2
// source: packages/core/src/protos/legacy_average_definitions.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";

export const protobufPackage = "blitzkit";

export interface AverageDefinitions {
  averages: { [key: number]: AverageDefinitionsEntry };
  samples: Samples;
  time: number;
}

export interface AverageDefinitions_AveragesEntry {
  key: number;
  value: AverageDefinitionsEntry | undefined;
}

export interface AverageDefinitionsEntry {
  mu: AverageDefinitionsAllStats;
  sigma: AverageDefinitionsAllStats;
  r: AverageDefinitionsAllStats;
  samples: Samples;
}

export interface AverageDefinitionsAllStats {
  battles: number;
  capture_points: number;
  damage_dealt: number;
  damage_received: number;
  dropped_capture_points: number;
  frags: number;
  frags8p: number;
  hits: number;
  losses: number;
  max_frags: number;
  max_xp: number;
  shots: number;
  spotted: number;
  survived_battles: number;
  win_and_survived: number;
  wins: number;
  xp: number;
  battle_life_time: number;
}

export interface Samples {
  d_1: number;
  d_7: number;
  d_30: number;
  d_60: number;
  d_90: number;
  d_120: number;
  total: number;
}

function createBaseAverageDefinitions(): AverageDefinitions {
  return { averages: {}, samples: createBaseSamples(), time: 0 };
}

export const AverageDefinitions: MessageFns<AverageDefinitions> = {
  encode(message: AverageDefinitions, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    Object.entries(message.averages).forEach(([key, value]) => {
      AverageDefinitions_AveragesEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).join();
    });
    if (message.samples !== undefined) {
      Samples.encode(message.samples, writer.uint32(18).fork()).join();
    }
    if (message.time !== 0) {
      writer.uint32(24).uint64(message.time);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): AverageDefinitions {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAverageDefinitions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          const entry1 = AverageDefinitions_AveragesEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.averages[entry1.key] = entry1.value;
          }
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.samples = Samples.decode(reader, reader.uint32());
          continue;
        }
        case 3: {
          if (tag !== 24) {
            break;
          }

          message.time = longToNumber(reader.uint64());
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

  fromJSON(object: any): AverageDefinitions {
    return {
      averages: isObject(object.averages)
        ? Object.entries(object.averages).reduce<{ [key: number]: AverageDefinitionsEntry }>((acc, [key, value]) => {
          acc[globalThis.Number(key)] = AverageDefinitionsEntry.fromJSON(value);
          return acc;
        }, {})
        : {},
      samples: Samples.fromJSON(assertSet("AverageDefinitions.samples", object.samples)),
      time: globalThis.Number(assertSet("AverageDefinitions.time", object.time)),
    };
  },

  toJSON(message: AverageDefinitions): unknown {
    const obj: any = {};
    if (message.averages) {
      const entries = Object.entries(message.averages);
      if (entries.length > 0) {
        obj.averages = {};
        entries.forEach(([k, v]) => {
          obj.averages[k] = AverageDefinitionsEntry.toJSON(v);
        });
      }
    }
    if (message.samples !== undefined) {
      obj.samples = Samples.toJSON(message.samples);
    }
    if (message.time !== 0) {
      obj.time = Math.round(message.time);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<AverageDefinitions>, I>>(base?: I): AverageDefinitions {
    return AverageDefinitions.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<AverageDefinitions>, I>>(object: I): AverageDefinitions {
    const message = createBaseAverageDefinitions();
    message.averages = Object.entries(object.averages ?? {}).reduce<{ [key: number]: AverageDefinitionsEntry }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[globalThis.Number(key)] = AverageDefinitionsEntry.fromPartial(value);
        }
        return acc;
      },
      {},
    );
    message.samples = (object.samples !== undefined && object.samples !== null)
      ? Samples.fromPartial(object.samples)
      : createBaseSamples();
    message.time = object.time ?? 0;
    return message;
  },
};

function createBaseAverageDefinitions_AveragesEntry(): AverageDefinitions_AveragesEntry {
  return { key: 0, value: createBaseAverageDefinitionsEntry() };
}

export const AverageDefinitions_AveragesEntry: MessageFns<AverageDefinitions_AveragesEntry> = {
  encode(message: AverageDefinitions_AveragesEntry, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.key !== undefined) {
      writer.uint32(8).uint32(message.key);
    }
    if (message.value !== undefined) {
      AverageDefinitionsEntry.encode(message.value, writer.uint32(18).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): AverageDefinitions_AveragesEntry {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAverageDefinitions_AveragesEntry();
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

          message.value = AverageDefinitionsEntry.decode(reader, reader.uint32());
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

  fromJSON(object: any): AverageDefinitions_AveragesEntry {
    return {
      key: globalThis.Number(assertSet("AverageDefinitions_AveragesEntry.key", object.key)),
      value: AverageDefinitionsEntry.fromJSON(assertSet("AverageDefinitions_AveragesEntry.value", object.value)),
    };
  },

  toJSON(message: AverageDefinitions_AveragesEntry): unknown {
    const obj: any = {};
    if (message.key !== undefined) {
      obj.key = Math.round(message.key);
    }
    if (message.value !== undefined) {
      obj.value = AverageDefinitionsEntry.toJSON(message.value);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<AverageDefinitions_AveragesEntry>, I>>(
    base?: I,
  ): AverageDefinitions_AveragesEntry {
    return AverageDefinitions_AveragesEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<AverageDefinitions_AveragesEntry>, I>>(
    object: I,
  ): AverageDefinitions_AveragesEntry {
    const message = createBaseAverageDefinitions_AveragesEntry();
    message.key = object.key ?? 0;
    message.value = (object.value !== undefined && object.value !== null)
      ? AverageDefinitionsEntry.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseAverageDefinitionsEntry(): AverageDefinitionsEntry {
  return {
    mu: createBaseAverageDefinitionsAllStats(),
    sigma: createBaseAverageDefinitionsAllStats(),
    r: createBaseAverageDefinitionsAllStats(),
    samples: createBaseSamples(),
  };
}

export const AverageDefinitionsEntry: MessageFns<AverageDefinitionsEntry> = {
  encode(message: AverageDefinitionsEntry, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.mu !== undefined) {
      AverageDefinitionsAllStats.encode(message.mu, writer.uint32(10).fork()).join();
    }
    if (message.sigma !== undefined) {
      AverageDefinitionsAllStats.encode(message.sigma, writer.uint32(18).fork()).join();
    }
    if (message.r !== undefined) {
      AverageDefinitionsAllStats.encode(message.r, writer.uint32(26).fork()).join();
    }
    if (message.samples !== undefined) {
      Samples.encode(message.samples, writer.uint32(34).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): AverageDefinitionsEntry {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAverageDefinitionsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.mu = AverageDefinitionsAllStats.decode(reader, reader.uint32());
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.sigma = AverageDefinitionsAllStats.decode(reader, reader.uint32());
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }

          message.r = AverageDefinitionsAllStats.decode(reader, reader.uint32());
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }

          message.samples = Samples.decode(reader, reader.uint32());
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

  fromJSON(object: any): AverageDefinitionsEntry {
    return {
      mu: AverageDefinitionsAllStats.fromJSON(assertSet("AverageDefinitionsEntry.mu", object.mu)),
      sigma: AverageDefinitionsAllStats.fromJSON(assertSet("AverageDefinitionsEntry.sigma", object.sigma)),
      r: AverageDefinitionsAllStats.fromJSON(assertSet("AverageDefinitionsEntry.r", object.r)),
      samples: Samples.fromJSON(assertSet("AverageDefinitionsEntry.samples", object.samples)),
    };
  },

  toJSON(message: AverageDefinitionsEntry): unknown {
    const obj: any = {};
    if (message.mu !== undefined) {
      obj.mu = AverageDefinitionsAllStats.toJSON(message.mu);
    }
    if (message.sigma !== undefined) {
      obj.sigma = AverageDefinitionsAllStats.toJSON(message.sigma);
    }
    if (message.r !== undefined) {
      obj.r = AverageDefinitionsAllStats.toJSON(message.r);
    }
    if (message.samples !== undefined) {
      obj.samples = Samples.toJSON(message.samples);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<AverageDefinitionsEntry>, I>>(base?: I): AverageDefinitionsEntry {
    return AverageDefinitionsEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<AverageDefinitionsEntry>, I>>(object: I): AverageDefinitionsEntry {
    const message = createBaseAverageDefinitionsEntry();
    message.mu = (object.mu !== undefined && object.mu !== null)
      ? AverageDefinitionsAllStats.fromPartial(object.mu)
      : createBaseAverageDefinitionsAllStats();
    message.sigma = (object.sigma !== undefined && object.sigma !== null)
      ? AverageDefinitionsAllStats.fromPartial(object.sigma)
      : createBaseAverageDefinitionsAllStats();
    message.r = (object.r !== undefined && object.r !== null)
      ? AverageDefinitionsAllStats.fromPartial(object.r)
      : createBaseAverageDefinitionsAllStats();
    message.samples = (object.samples !== undefined && object.samples !== null)
      ? Samples.fromPartial(object.samples)
      : createBaseSamples();
    return message;
  },
};

function createBaseAverageDefinitionsAllStats(): AverageDefinitionsAllStats {
  return {
    battles: 0,
    capture_points: 0,
    damage_dealt: 0,
    damage_received: 0,
    dropped_capture_points: 0,
    frags: 0,
    frags8p: 0,
    hits: 0,
    losses: 0,
    max_frags: 0,
    max_xp: 0,
    shots: 0,
    spotted: 0,
    survived_battles: 0,
    win_and_survived: 0,
    wins: 0,
    xp: 0,
    battle_life_time: 0,
  };
}

export const AverageDefinitionsAllStats: MessageFns<AverageDefinitionsAllStats> = {
  encode(message: AverageDefinitionsAllStats, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.battles !== 0) {
      writer.uint32(13).float(message.battles);
    }
    if (message.capture_points !== 0) {
      writer.uint32(21).float(message.capture_points);
    }
    if (message.damage_dealt !== 0) {
      writer.uint32(29).float(message.damage_dealt);
    }
    if (message.damage_received !== 0) {
      writer.uint32(37).float(message.damage_received);
    }
    if (message.dropped_capture_points !== 0) {
      writer.uint32(45).float(message.dropped_capture_points);
    }
    if (message.frags !== 0) {
      writer.uint32(53).float(message.frags);
    }
    if (message.frags8p !== 0) {
      writer.uint32(61).float(message.frags8p);
    }
    if (message.hits !== 0) {
      writer.uint32(69).float(message.hits);
    }
    if (message.losses !== 0) {
      writer.uint32(77).float(message.losses);
    }
    if (message.max_frags !== 0) {
      writer.uint32(85).float(message.max_frags);
    }
    if (message.max_xp !== 0) {
      writer.uint32(93).float(message.max_xp);
    }
    if (message.shots !== 0) {
      writer.uint32(101).float(message.shots);
    }
    if (message.spotted !== 0) {
      writer.uint32(109).float(message.spotted);
    }
    if (message.survived_battles !== 0) {
      writer.uint32(117).float(message.survived_battles);
    }
    if (message.win_and_survived !== 0) {
      writer.uint32(125).float(message.win_and_survived);
    }
    if (message.wins !== 0) {
      writer.uint32(133).float(message.wins);
    }
    if (message.xp !== 0) {
      writer.uint32(141).float(message.xp);
    }
    if (message.battle_life_time !== 0) {
      writer.uint32(149).float(message.battle_life_time);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): AverageDefinitionsAllStats {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAverageDefinitionsAllStats();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 13) {
            break;
          }

          message.battles = reader.float();
          continue;
        }
        case 2: {
          if (tag !== 21) {
            break;
          }

          message.capture_points = reader.float();
          continue;
        }
        case 3: {
          if (tag !== 29) {
            break;
          }

          message.damage_dealt = reader.float();
          continue;
        }
        case 4: {
          if (tag !== 37) {
            break;
          }

          message.damage_received = reader.float();
          continue;
        }
        case 5: {
          if (tag !== 45) {
            break;
          }

          message.dropped_capture_points = reader.float();
          continue;
        }
        case 6: {
          if (tag !== 53) {
            break;
          }

          message.frags = reader.float();
          continue;
        }
        case 7: {
          if (tag !== 61) {
            break;
          }

          message.frags8p = reader.float();
          continue;
        }
        case 8: {
          if (tag !== 69) {
            break;
          }

          message.hits = reader.float();
          continue;
        }
        case 9: {
          if (tag !== 77) {
            break;
          }

          message.losses = reader.float();
          continue;
        }
        case 10: {
          if (tag !== 85) {
            break;
          }

          message.max_frags = reader.float();
          continue;
        }
        case 11: {
          if (tag !== 93) {
            break;
          }

          message.max_xp = reader.float();
          continue;
        }
        case 12: {
          if (tag !== 101) {
            break;
          }

          message.shots = reader.float();
          continue;
        }
        case 13: {
          if (tag !== 109) {
            break;
          }

          message.spotted = reader.float();
          continue;
        }
        case 14: {
          if (tag !== 117) {
            break;
          }

          message.survived_battles = reader.float();
          continue;
        }
        case 15: {
          if (tag !== 125) {
            break;
          }

          message.win_and_survived = reader.float();
          continue;
        }
        case 16: {
          if (tag !== 133) {
            break;
          }

          message.wins = reader.float();
          continue;
        }
        case 17: {
          if (tag !== 141) {
            break;
          }

          message.xp = reader.float();
          continue;
        }
        case 18: {
          if (tag !== 149) {
            break;
          }

          message.battle_life_time = reader.float();
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

  fromJSON(object: any): AverageDefinitionsAllStats {
    return {
      battles: globalThis.Number(assertSet("AverageDefinitionsAllStats.battles", object.battles)),
      capture_points: globalThis.Number(assertSet("AverageDefinitionsAllStats.capture_points", object.capture_points)),
      damage_dealt: globalThis.Number(assertSet("AverageDefinitionsAllStats.damage_dealt", object.damage_dealt)),
      damage_received: globalThis.Number(
        assertSet("AverageDefinitionsAllStats.damage_received", object.damage_received),
      ),
      dropped_capture_points: globalThis.Number(
        assertSet("AverageDefinitionsAllStats.dropped_capture_points", object.dropped_capture_points),
      ),
      frags: globalThis.Number(assertSet("AverageDefinitionsAllStats.frags", object.frags)),
      frags8p: globalThis.Number(assertSet("AverageDefinitionsAllStats.frags8p", object.frags8p)),
      hits: globalThis.Number(assertSet("AverageDefinitionsAllStats.hits", object.hits)),
      losses: globalThis.Number(assertSet("AverageDefinitionsAllStats.losses", object.losses)),
      max_frags: globalThis.Number(assertSet("AverageDefinitionsAllStats.max_frags", object.max_frags)),
      max_xp: globalThis.Number(assertSet("AverageDefinitionsAllStats.max_xp", object.max_xp)),
      shots: globalThis.Number(assertSet("AverageDefinitionsAllStats.shots", object.shots)),
      spotted: globalThis.Number(assertSet("AverageDefinitionsAllStats.spotted", object.spotted)),
      survived_battles: globalThis.Number(
        assertSet("AverageDefinitionsAllStats.survived_battles", object.survived_battles),
      ),
      win_and_survived: globalThis.Number(
        assertSet("AverageDefinitionsAllStats.win_and_survived", object.win_and_survived),
      ),
      wins: globalThis.Number(assertSet("AverageDefinitionsAllStats.wins", object.wins)),
      xp: globalThis.Number(assertSet("AverageDefinitionsAllStats.xp", object.xp)),
      battle_life_time: globalThis.Number(
        assertSet("AverageDefinitionsAllStats.battle_life_time", object.battle_life_time),
      ),
    };
  },

  toJSON(message: AverageDefinitionsAllStats): unknown {
    const obj: any = {};
    if (message.battles !== 0) {
      obj.battles = message.battles;
    }
    if (message.capture_points !== 0) {
      obj.capture_points = message.capture_points;
    }
    if (message.damage_dealt !== 0) {
      obj.damage_dealt = message.damage_dealt;
    }
    if (message.damage_received !== 0) {
      obj.damage_received = message.damage_received;
    }
    if (message.dropped_capture_points !== 0) {
      obj.dropped_capture_points = message.dropped_capture_points;
    }
    if (message.frags !== 0) {
      obj.frags = message.frags;
    }
    if (message.frags8p !== 0) {
      obj.frags8p = message.frags8p;
    }
    if (message.hits !== 0) {
      obj.hits = message.hits;
    }
    if (message.losses !== 0) {
      obj.losses = message.losses;
    }
    if (message.max_frags !== 0) {
      obj.max_frags = message.max_frags;
    }
    if (message.max_xp !== 0) {
      obj.max_xp = message.max_xp;
    }
    if (message.shots !== 0) {
      obj.shots = message.shots;
    }
    if (message.spotted !== 0) {
      obj.spotted = message.spotted;
    }
    if (message.survived_battles !== 0) {
      obj.survived_battles = message.survived_battles;
    }
    if (message.win_and_survived !== 0) {
      obj.win_and_survived = message.win_and_survived;
    }
    if (message.wins !== 0) {
      obj.wins = message.wins;
    }
    if (message.xp !== 0) {
      obj.xp = message.xp;
    }
    if (message.battle_life_time !== 0) {
      obj.battle_life_time = message.battle_life_time;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<AverageDefinitionsAllStats>, I>>(base?: I): AverageDefinitionsAllStats {
    return AverageDefinitionsAllStats.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<AverageDefinitionsAllStats>, I>>(object: I): AverageDefinitionsAllStats {
    const message = createBaseAverageDefinitionsAllStats();
    message.battles = object.battles ?? 0;
    message.capture_points = object.capture_points ?? 0;
    message.damage_dealt = object.damage_dealt ?? 0;
    message.damage_received = object.damage_received ?? 0;
    message.dropped_capture_points = object.dropped_capture_points ?? 0;
    message.frags = object.frags ?? 0;
    message.frags8p = object.frags8p ?? 0;
    message.hits = object.hits ?? 0;
    message.losses = object.losses ?? 0;
    message.max_frags = object.max_frags ?? 0;
    message.max_xp = object.max_xp ?? 0;
    message.shots = object.shots ?? 0;
    message.spotted = object.spotted ?? 0;
    message.survived_battles = object.survived_battles ?? 0;
    message.win_and_survived = object.win_and_survived ?? 0;
    message.wins = object.wins ?? 0;
    message.xp = object.xp ?? 0;
    message.battle_life_time = object.battle_life_time ?? 0;
    return message;
  },
};

function createBaseSamples(): Samples {
  return { d_1: 0, d_7: 0, d_30: 0, d_60: 0, d_90: 0, d_120: 0, total: 0 };
}

export const Samples: MessageFns<Samples> = {
  encode(message: Samples, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.d_1 !== 0) {
      writer.uint32(8).uint32(message.d_1);
    }
    if (message.d_7 !== 0) {
      writer.uint32(16).uint32(message.d_7);
    }
    if (message.d_30 !== 0) {
      writer.uint32(24).uint32(message.d_30);
    }
    if (message.d_60 !== 0) {
      writer.uint32(32).uint32(message.d_60);
    }
    if (message.d_90 !== 0) {
      writer.uint32(40).uint32(message.d_90);
    }
    if (message.d_120 !== 0) {
      writer.uint32(48).uint32(message.d_120);
    }
    if (message.total !== 0) {
      writer.uint32(56).uint32(message.total);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): Samples {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSamples();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.d_1 = reader.uint32();
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }

          message.d_7 = reader.uint32();
          continue;
        }
        case 3: {
          if (tag !== 24) {
            break;
          }

          message.d_30 = reader.uint32();
          continue;
        }
        case 4: {
          if (tag !== 32) {
            break;
          }

          message.d_60 = reader.uint32();
          continue;
        }
        case 5: {
          if (tag !== 40) {
            break;
          }

          message.d_90 = reader.uint32();
          continue;
        }
        case 6: {
          if (tag !== 48) {
            break;
          }

          message.d_120 = reader.uint32();
          continue;
        }
        case 7: {
          if (tag !== 56) {
            break;
          }

          message.total = reader.uint32();
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

  fromJSON(object: any): Samples {
    return {
      d_1: globalThis.Number(assertSet("Samples.d_1", object.d_1)),
      d_7: globalThis.Number(assertSet("Samples.d_7", object.d_7)),
      d_30: globalThis.Number(assertSet("Samples.d_30", object.d_30)),
      d_60: globalThis.Number(assertSet("Samples.d_60", object.d_60)),
      d_90: globalThis.Number(assertSet("Samples.d_90", object.d_90)),
      d_120: globalThis.Number(assertSet("Samples.d_120", object.d_120)),
      total: globalThis.Number(assertSet("Samples.total", object.total)),
    };
  },

  toJSON(message: Samples): unknown {
    const obj: any = {};
    if (message.d_1 !== 0) {
      obj.d_1 = Math.round(message.d_1);
    }
    if (message.d_7 !== 0) {
      obj.d_7 = Math.round(message.d_7);
    }
    if (message.d_30 !== 0) {
      obj.d_30 = Math.round(message.d_30);
    }
    if (message.d_60 !== 0) {
      obj.d_60 = Math.round(message.d_60);
    }
    if (message.d_90 !== 0) {
      obj.d_90 = Math.round(message.d_90);
    }
    if (message.d_120 !== 0) {
      obj.d_120 = Math.round(message.d_120);
    }
    if (message.total !== 0) {
      obj.total = Math.round(message.total);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Samples>, I>>(base?: I): Samples {
    return Samples.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Samples>, I>>(object: I): Samples {
    const message = createBaseSamples();
    message.d_1 = object.d_1 ?? 0;
    message.d_7 = object.d_7 ?? 0;
    message.d_30 = object.d_30 ?? 0;
    message.d_60 = object.d_60 ?? 0;
    message.d_90 = object.d_90 ?? 0;
    message.d_120 = object.d_120 ?? 0;
    message.total = object.total ?? 0;
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

function longToNumber(int64: { toString(): string }): number {
  const num = globalThis.Number(int64.toString());
  if (num > globalThis.Number.MAX_SAFE_INTEGER) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  if (num < globalThis.Number.MIN_SAFE_INTEGER) {
    throw new globalThis.Error("Value is smaller than Number.MIN_SAFE_INTEGER");
  }
  return num;
}

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
