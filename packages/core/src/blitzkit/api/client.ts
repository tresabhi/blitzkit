import { BlitzKitAvatars } from '@protos/blitzkit';
import { MetadataAccessor } from '../../blitz/metadata';
import { BlitzkitAPI } from './abstract';

export class BlitzkitClientAPI extends BlitzkitAPI {
  get metadata(): MetadataAccessor {
    throw new Error('Cannot access metadata from client');
  }

  async avatars() {
    const response = await fetch('/api/internal/avatars.pb');
    const buffer = await response.arrayBuffer();
    return BlitzKitAvatars.decode(new Uint8Array(buffer));
  }
}
