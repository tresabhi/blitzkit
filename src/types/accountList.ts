export interface Account {
  nickname: string;
  account_id: number;
}

type AccountList =
  | {
      data?: Account[];
    }
  | undefined;

export default AccountList;
