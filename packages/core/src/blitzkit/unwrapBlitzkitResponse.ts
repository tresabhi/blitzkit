import { BlitzkitResponse } from '../../../website/src/hooks/useTankVotes';

export function unwrapBlitzkitResponse<Data>(response: BlitzkitResponse<Data>) {
  if (response.status === 'error') {
    throw new Error(response.error, { cause: response.message });
  }

  return response.data;
}
