import { fetchPB } from '../protobuf';
import { SkillDefinitions } from '../protos';
import { asset } from './asset';

export function fetchSkillDefinitions() {
  return fetchPB(asset('definitions/skills.pb'), SkillDefinitions);
}
