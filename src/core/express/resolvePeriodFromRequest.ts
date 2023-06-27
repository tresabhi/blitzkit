import { Request } from 'express';
import { CYCLIC_API } from '../../constants/cyclic.js';
import resolvePeriodFromURL from './resolvePeriodFromURL.js';

export default function resolvePeriodFromRequest(request: Request) {
  return resolvePeriodFromURL(`${CYCLIC_API}${request.path}`);
}
