export type TokenValue = {
  currency: string;
  date: string;
  price: number;
};

export type TokenData = TokenValue & {
  icon?: string;
};

export type TokenListFields = {
  from: string;
  to: string;
  fromAmount: number;
  toAmount: number;
};
