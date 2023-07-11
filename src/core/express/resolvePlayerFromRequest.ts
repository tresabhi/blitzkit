import { Request } from 'express';
import { CYCLIC_API } from '../../constants/cyclic';
import resolvePlayerFromURL from './resolvePlayerFromURL';

export default function resolvePlayerFromRequest(request: Request) {
  return resolvePlayerFromURL(`${CYCLIC_API}${request.originalUrl}`);
}
