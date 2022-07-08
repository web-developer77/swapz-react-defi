import axios from "axios";
import { useState, useEffect } from "react";
import { useActiveWeb3React } from "../hooks/useActiveWeb3React";

const MARKET_CAP_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=nerve-finance&vs_currencies=USD&include_market_cap=true";

const FALLBACK_MARKET_CAP = 100000000;

export function useNrvMarketCap() {
  const { account } = useActiveWeb3React();
  const [marketCap, setMarketCap] = useState(FALLBACK_MARKET_CAP);

  async function effectFunc() {
    const requestResponse = await axios(MARKET_CAP_URL);
    const usdMarketCap = requestResponse.data?.["nerve-finance"].usd_market_cap;

    setMarketCap(usdMarketCap ?? FALLBACK_MARKET_CAP);
  }
  useEffect(effectFunc, [account]);

  return marketCap;
}
