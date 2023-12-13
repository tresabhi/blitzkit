import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import fetchBlitz from './fetchBlitz';

export interface EncyclopediaInfo {
  achievement_sections: Record<string, { name: string; order: number }>;
  tanks_updated_at: number;
  languages: Record<string, string>;
  vehicle_types: Record<string, string>;
  vehicle_nations: Record<string, string>;
  game_version: string;
}

export const encyclopediaInfo = fetchBlitz<EncyclopediaInfo>(
  `https://api.wotblitz.com/wotb/encyclopedia/info/?application_id=${WARGAMING_APPLICATION_ID}`,
);
