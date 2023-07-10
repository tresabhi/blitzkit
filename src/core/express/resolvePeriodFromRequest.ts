import { Request } from 'express';
import { CYCLIC_API } from '../../constants/cyclic.js';
import { BlitzServer } from '../../constants/servers.js';
import resolvePeriodFromURL from './resolvePeriodFromURL.js';

export default function resolvePeriodFromRequest(
  server: BlitzServer,
  request: Request,
) {
  return resolvePeriodFromURL(server, `${CYCLIC_API}${request.path}`);
}
