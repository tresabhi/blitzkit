import { apiBlobProxyCurry } from '../../../core/blitzkit/blobMirror';

/**
 * Returns meta data similar to tanks/[id].json but for all tanks as an array. There is no guarantee of order.
 *
 * @proto tanks_full
 */
export const GET = apiBlobProxyCurry('/tanks/full.pb');
