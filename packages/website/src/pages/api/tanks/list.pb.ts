import { apiBlobProxyCurry } from '../../../core/blitzkit/blobMirror';

/**
 * Returns a list of all tank ids. There is no guarantee of order.
 *
 * @proto tanks
 */
export const GET = apiBlobProxyCurry('/tanks/list.pb');
