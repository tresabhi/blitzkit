import { apiMirror } from '../../../core/blitzkit/blobMirror';

/**
 * Returns a list of all tank ids. There is no guarantee of order.
 *
 * @returns JSON.
 */
export const GET = apiMirror('/tanks/list.pb');
