export type WargamingResponse<Data extends object> =
  | {
      status: 'error';
      error: {
        field: string;
        message: string;
        code: 402;
        value: null;
      };
    }
  | {
      status: 'ok';
      data: Data;
    };
