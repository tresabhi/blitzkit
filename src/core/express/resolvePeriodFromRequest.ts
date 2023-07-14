import { Request } from 'express';
import { CYCLIC_API } from '../../constants/cyclic';
import { RegionDomain } from '../../constants/regions';
import resolvePeriodFromURL from './resolvePeriodFromURL';

export default function resolvePeriodFromRequest(
  server: RegionDomain,
  request: Request,
) {
  return resolvePeriodFromURL(server, `${CYCLIC_API}${request.path}`);
}
