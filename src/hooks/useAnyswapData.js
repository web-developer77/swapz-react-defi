import axios from "axios";
import { useState, useEffect } from "react";
import { useActiveWeb3React } from "../hooks/useActiveWeb3React";

const ANYSWAP_BASE_URL = "https://bridgeapi.anyswap.exchange/v2";

export function useAnyswapData() {
  const { account } = useActiveWeb3React();
  const [anyswapData, setAnyswapData] = useState({});

  async function effectFunc() {
    if (account) {
      const [ETHResult, BTCResult] = await Promise.all([
        axios(`${ANYSWAP_BASE_URL}/serverInfo/56`),
        axios(`${ANYSWAP_BASE_URL}/register/${account}/56/BTC`),
      ]);

      setAnyswapData({
        ETH: ETHResult.data.eth,
        USDT: ETHResult.data.usdtv3,
        BTC: {
          ...ETHResult.data.btc,
          ...BTCResult.data,
        },
      });
    }
  }
  useEffect(effectFunc, [account]);

  return anyswapData;
}
