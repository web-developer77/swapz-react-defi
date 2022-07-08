import { useState, useEffect, useContext } from "react";

import { Context } from "../store";

import { useActiveWeb3React } from "../hooks/useActiveWeb3React";
import { useGetNRVPrice } from "../hooks/useGetNRVPrice";

const FALLBACK_NRV_PRICE = 1;

export function useNrvPrice() {
  const { account } = useActiveWeb3React();
  const [state] = useContext(Context);
  const [usdPrice, setUsdPrice] = useState(FALLBACK_NRV_PRICE);
  const getNrvPrice = useGetNRVPrice();

  async function effectFunc() {
    const obj = await getNrvPrice();
    const { nrvPriceUSDPrice } = obj;

    setUsdPrice(nrvPriceUSDPrice ?? FALLBACK_NRV_PRICE);
  }

  useEffect(effectFunc, [account]);

  if (state.nrvPrice === 0 || state.nrvPrice === "") {
    return usdPrice;
  } else {
    return state.nrvPrice;
  }
}
