export type WargamingResponse<Data extends object> =
  | {
      status: 'error';
    }
  | {
      status: 'ok';
      data: Data;
    };
