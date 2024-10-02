export function unwrapBlitzkitResponse<Data>(response: BlitzkitResponse<Data>) {
  if (response.status === 'error') {
    throw new Error(response.error, { cause: response.message });
  }

  return response.data;
}
export interface BlitzkitResponseError {
  status: 'error';
  error: string;
  message?: unknown;
}
export type BlitzkitResponse<Data = undefined> =
  | BlitzkitResponseError
  | {
      status: 'ok';
      data: Data;
    };
