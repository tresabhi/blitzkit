import { Vector3Tuple, Vector4Tuple } from 'three';
import { ScpgStream } from './scpg';

export interface SC2 {
  '#dataNodes': DataNode[];
  '#hierarchy': Hierarchy[];
  '#sceneComponents': SceneComponents;
}

type DataNode = {
  '##name': 'NMaterial';
  '#id': Buffer;
  materialName: string;
  parentMaterialKey?: bigint;
  qualityGroup?: string;
  fxName?: string;

  textures?: Textures;
} & (
  | ({
      configCount: number;
    } & Record<`configArchive_${number}`, ConfigArchive>)
  | {
      configCount: undefined;
    }
);

interface ConfigArchive {
  configName: string;
  fxName: string;
  properties: Properties;
  textureSampleStates: TextureSampleStates;
  textures: Textures;
  customCullMode?: number;
  enabledPresets?: EnabledPresets;
  flags?: Flags;
}

interface EnabledPresets {
  AlphaTest: boolean;
}

interface Flags {
  AMBIENT_ATTENUATION_BOX: number;
}

interface Properties {
  alphatestThreshold: Buffer;
  attenuationBoxHalfSize: Buffer;
  attenuationBoxSmoothness: Buffer;
  baseColorFactor?: Buffer;
  decalTileCoordScale?: Buffer;
  inGlossiness: Buffer;
  inSpecularity: Buffer;
  metalFresnelReflectance: Buffer;
  metallicRoughnessFactor?: Buffer;
}

interface TextureSampleStates {
  albedo: number;
  baseColorMap: number;
  baseNormalMap: number;
  baseRMMap: number;
  decalmask?: number;
  maskMap: number;
  miscMap: number;
  normalmap: number;
}

export interface Textures {
  albedo: string;
  baseColorMap?: string;
  baseNormalMap?: string;
  baseRMMap?: string;
  decalmask?: string;
  maskMap?: string;
  miscMap?: string;
  normalmap?: string;
}

export interface Hierarchy {
  '##name': 'Entity';
  '#hierarchy'?: Hierarchy[];
  components: Components;
  flags: number;
  id: bigint;
  name: string;
}

// 0001, 0002, 0003...: Component
type Components = {
  count: number;
} & Record<string, Component>;

// 0001, 0002, 0003...
type RoBatches = Record<
  string,
  {
    '##name': 'RenderBatch';
    'rb.aabbox': RbAabbox;
    'rb.classname': 'RenderBatch';
    'rb.datasource': bigint;
    'rb.nmatname': bigint;
    'rb.sortingKey': number;
  }
>;

interface RbAabbox {
  minimum: number[];
  maximum: number[];
}

export type Component =
  | {
      'comp.typename': 'TransformComponent';
      'tc.localRotation': Vector4Tuple;
      'tc.localScale': Vector3Tuple;
      'tc.localTranslation': Vector3Tuple;
      'tc.worldRotation': Vector4Tuple;
      'tc.worldScale': Vector3Tuple;
      'tc.worldTranslation': Vector3Tuple;
    }
  | {
      'comp.typename': 'RenderComponent';
      'rc.renderObj': {
        '##name': 'Mesh';
        'ro.batchCount': number;
        'ro.batches': RoBatches;
        'ro.debugflags': number;
        'ro.flags': number;
        'ro.notShadowOnly': boolean;
        'ro.sOclCull': boolean;
        'ro.sOclIndex': number;
      } & Record<`rb${number}.${'lodIndex' | 'switchIndex'}`, number>;
    }
  | {
      'comp.typename': 'SlotComponent';
      'sc.attachmentRotation': number[];
      'sc.attachmentScale': number[];
      'sc.attachmentTranslation': number[];
      'sc.configFilePath': string;
      'sc.slotName': string;
      'sc.template': string;
      'sc.typeFiltersCount': number;
    }
  | {
      'comp.typename': 'LodComponent';
      'lc.loddist': Record<`distance${number}`, number>;
    }
  | {
      'comp.typename': 'DecorItemComponent';
      drawOrder: number;
      shouldApplyCamo: boolean;
      vanishTargetAlpha: number;
      vanishWhenArmorShown: boolean;
    }
  | {
      'comp.typename': 'NewSlotComponent';
      slotItemsCount: number;
      slots: {
        [key: string]: {
          configFilePath: string;
          name: string;
          transform: {
            position: Vector3Tuple;
            scale: Vector3Tuple;
            rotation: Vector4Tuple;
          };
        };
      };
    }
  | {
      'comp.typename': 'ScenarioComponent';
      'scenario.scriptId': string;
    }
  | ({
      'comp.typename': 'StateSwitcherComponent';
      'ssc.activeState': number;
      'ssc.statesCount': number;
    } & Record<`ssc.state${number}`, string>)
  | {
      'comp.typename': 'CustomPropertiesComponent';
      'cpc.properties.archive': {
        'editor.donotremove': number;
      };
    };

interface SceneComponents {
  count: number;
}

export class Sc2Stream extends ScpgStream {
  header() {
    return {
      name: this.ascii(4),
      version: this.uint32(),
      nodeCount: this.uint32(),
    };
  }

  versionTags() {
    return this.ka();
  }

  descriptor() {
    const size = this.uint32();
    const fileType = this.uint32();

    // other felids that we don't have any info about
    this.skip(size - 4);

    return { size, fileType };
  }

  sc2() {
    this.header();
    this.versionTags();
    this.descriptor();

    return this.ka() as SC2;
  }
}
