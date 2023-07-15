import { Request } from 'express';
import { CYCLIC_API } from '../../constants/cyclic';
import { Region } from '../../constants/regions';
import resolvePeriodFromURL from './resolvePeriodFromURL';

export default function resolvePeriodFromRequest(
  server: Region,
  request: Request,
) {
  return resolvePeriodFromURL(server, `${CYCLIC_API}${request.path}`);
}
