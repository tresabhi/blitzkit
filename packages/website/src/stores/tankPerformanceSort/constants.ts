import en from '@blitzkit/i18n/strings/en.json' with { type: 'json' };
import type { TankPerformanceSortType } from '.';

export const TankPerformanceSortTypeNamesArray = Object.keys(
  en.website.tools.performance.table.stats,
) as TankPerformanceSortType[];
