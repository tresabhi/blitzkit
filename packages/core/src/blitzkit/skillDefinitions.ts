import { SkillDefinitions } from '../protos';
import { asset } from './asset';

export async function fetchSkillDefinitions() {
  const response = await fetch(asset('definitions/skills.pb'));
  const buffer = await response.arrayBuffer();
  const array = new Uint8Array(buffer);

  return SkillDefinitions.deserializeBinary(array).toObject();
}
