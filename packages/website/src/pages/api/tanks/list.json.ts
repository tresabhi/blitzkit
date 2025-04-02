import { Tanks } from '@blitzkit/core';
import { jsonMirrorCurry } from '../../../core/blitzkit/blobMirror';

/**
 * Identical to tanks/list.pb but in JSON.
 *
 * @returns JSON.
 */
export const GET = jsonMirrorCurry('/tanks/list.pb', Tanks);
