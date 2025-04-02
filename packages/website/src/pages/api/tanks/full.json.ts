import { TanksFull } from '@blitzkit/core';
import { jsonMirrorCurry } from '../../../core/blitzkit/blobMirror';

/**
 * Identical to tanks/full.pb but in JSON.
 *
 * @warning This is a large response. Consider using tanks/[id]/meta.json for individual tanks.
 * @returns JSON.
 */
export const GET = jsonMirrorCurry('/tanks/full.pb', TanksFull);
