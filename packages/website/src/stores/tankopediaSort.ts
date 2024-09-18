import { map } from 'nanostores';
import {
  type TankopediaSortBy,
  type TankopediaSortDirection,
} from './tankopediaPersistent';

export interface TankopediaSort {
  by: TankopediaSortBy;
  direction: TankopediaSortDirection;
}

export const $tankopediaSort = map<TankopediaSort>({
  by: 'meta.none',
  direction: 'descending',
});
