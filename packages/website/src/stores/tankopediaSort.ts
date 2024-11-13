import { map } from 'nanostores';
import {
  type TankopediaSortBy,
  type TankopediaSortDirection,
} from './tankopediaPersistent';

export interface TankopediaSort {
  by: TankopediaSortBy;
  direction: TankopediaSortDirection;
}

export const initialTankopediaSort: TankopediaSort = {
  by: 'meta.none',
  direction: 'descending',
};

export const $tankopediaSort = map<TankopediaSort>(initialTankopediaSort);
