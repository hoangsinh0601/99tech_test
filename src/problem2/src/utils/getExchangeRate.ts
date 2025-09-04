import { TokenData } from "../models/token.models";

export function getExchangeRate(from?: string, to?: string): string | number {
  if (!from || !to) return 0;
  const fromData = JSON.parse(from ?? "{}") as TokenData;
  const toData = JSON.parse(to ?? "{}") as TokenData;

  return (fromData.price / toData.price).toFixed(5);
}
