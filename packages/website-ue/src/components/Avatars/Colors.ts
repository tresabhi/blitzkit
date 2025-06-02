import { Grade } from '@protos/blitz_static_standard_grades_enum';
import type { BadgeProps } from '@radix-ui/themes';

export const GRADE_COLORS = {
  [Grade.GRADE_UNSPECIFIED]: 'gray',
  [Grade.GRADE_COMMON]: 'gray',
  [Grade.GRADE_RARE]: 'blue',
  [Grade.GRADE_EPIC]: 'purple',
  [Grade.GRADE_LEGENDARY]: 'amber',
} satisfies Record<Grade, BadgeProps['color']>;
