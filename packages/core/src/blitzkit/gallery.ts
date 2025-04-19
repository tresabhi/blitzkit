import { fetchPB } from '../protobuf';
import { Gallery } from '../protos';
import { asset } from './asset';

export function fetchGallery() {
  return fetchPB(asset('definitions/gallery.pb'), Gallery);
}
