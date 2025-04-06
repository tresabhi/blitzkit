import { TanksFull } from '@blitzkit/core';
import { jsonMirrorCurry } from '../../../core/blitzkit/blobMirror';

/**
 * Returns meta data similar to tanks/[id].json but for all tanks as an array. There is no guarantee of order.
 *
 * @warning This is a large response. Consider using tanks/[id]/meta.json for individual tanks.
 * @proto tanks_full
 * @returns JSON.
 */
export const GET = jsonMirrorCurry('/tanks/full.pb', TanksFull);
