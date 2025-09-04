import { TokenData, TokenValue } from "../models/token.models";
const DELAYS_TIME = 1000;

export async function fetchTokenList(): Promise<TokenData[]> {
  const response = await fetch("https://interview.switcheo.com/prices.json");
  const body = await response.json();
  const tokenList = body.map((token: TokenValue) => ({
    ...token,
    icon: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token.currency}.svg`,
  }));

  const uniqueData = tokenList.filter(
    (value: TokenData, index: number, self: TokenData[]) =>
      index ===
      self.findIndex(
        (t) =>
          t.currency === value.currency &&
          t.date === value.date &&
          t.price === value.price
      )
  );

  await new Promise((resolve) => setTimeout(resolve, DELAYS_TIME));

  return uniqueData;
}
