import { SkillDefinitions } from '../protos';
import { fetchPB } from '../types';
import { asset } from './asset';

export function fetchSkillDefinitions() {
  return fetchPB(asset('definitions/skills.pb'), SkillDefinitions);
}
