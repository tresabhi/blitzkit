import { BlitzKitAvatars } from '@protos/blitzkit';
import { MetadataAccessor } from '../../blitz/metadata';

export abstract class BlitzkitAPI {
  abstract metadata: MetadataAccessor;

  abstract avatars(): Promise<BlitzKitAvatars>;
}
