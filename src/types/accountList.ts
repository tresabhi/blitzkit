type AccountList =
  | {
      data?: { nickname: string; account_id: number }[];
    }
  | undefined;

export default AccountList;
