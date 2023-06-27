import { Request } from 'express';
import { CYCLIC_API } from '../../constants/cyclic.js';
import resolvePlayerFromURL from './resolvePlayerFromURL.js';

export default function resolvePlayerFromRequest(request: Request) {
  return resolvePlayerFromURL(`${CYCLIC_API}${request.path}`);
}
