import { Request } from 'express';
import { CYCLIC_API } from '../../constants/cyclic';
import { BlitzServer } from '../../constants/servers';
import resolvePeriodFromURL from './resolvePeriodFromURL';

export default function resolvePeriodFromRequest(
  server: BlitzServer,
  request: Request,
) {
  return resolvePeriodFromURL(server, `${CYCLIC_API}${request.path}`);
}
