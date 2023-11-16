import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import fetchBlitz from './fetchBlitz';

export interface TankopediaInfo {
  achievement_sections: Record<string, { name: string; order: number }>;
  tanks_updated_at: number;
  languages: Record<string, string>;
  vehicle_types: Record<string, string>;
  vehicle_nations: Record<string, string>;
  game_version: string;
}

export const tankopediaInfo = fetchBlitz<TankopediaInfo>(
  `https://api.wotblitz.com/wotb/encyclopedia/info/?application_id=${WARGAMING_APPLICATION_ID}`,
);
