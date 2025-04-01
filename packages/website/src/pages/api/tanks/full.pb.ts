import { apiMirror } from '../../../core/blitzkit/blobMirror';

/**
 * Returns meta data similar to tanks/[id].json but for all tanks as an array. There is no guarantee of order.
 *
 * @proto TanksFull
 */
export const GET = apiMirror('/tanks/full.pb');
