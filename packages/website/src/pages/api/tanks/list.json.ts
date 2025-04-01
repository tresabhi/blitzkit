import { Tanks } from '@blitzkit/core';
import { jsonMirror } from '../../../core/blitzkit/blobMirror';

/**
 * Identical to tanks/list.pb but in JSON.
 *
 * @returns JSON.
 */
export const GET = jsonMirror('/tanks/list.pb', Tanks);
