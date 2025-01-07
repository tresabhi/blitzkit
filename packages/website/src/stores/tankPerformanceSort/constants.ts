import en from '@blitzkit/core/lang/en.json';
import type { TankPerformanceSortType } from '.';

export const TankPerformanceSortTypeNamesArray = Object.keys(
  en.website.tools.performance.table.stats,
) as TankPerformanceSortType[];
