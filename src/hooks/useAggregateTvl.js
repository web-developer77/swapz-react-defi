// import _ from "lodash";
import axios from "axios";

import { useEffect, useState } from "react";

import { formatUnits } from "@ethersproject/units";

import {
  STABLECOIN_POOL_NAME,
  NRVBTC_POOL_NAME,
  NRVETH_POOL_NAME,
} from "../constants";

import { usePoolData } from "../hooks/usePoolData";
import { useXNrvTvl } from "../hooks/useXNrvTvl";

// updates price every ~30s
const PRICE_UPDATE_INTERVAL = 30000;

export function useAggregateTvl() {
  // Includes xNRV staking
  const xNrvData = useXNrvTvl();
  const [stablePoolData] = usePoolData(STABLECOIN_POOL_NAME);
  const [btcPoolData] = usePoolData(NRVBTC_POOL_NAME);
  const [ethPoolData] = usePoolData(NRVETH_POOL_NAME);

  const [btcPrice, setBtcPrice] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);

  function intervalFunc() {
    async function fetchPrice() {
      const [btcAxios, ethAxios] = await Promise.all([
        axios(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=USD"
        ),
        axios(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=USD"
        ),
      ]);

      if (btcAxios.status === 200 && ethAxios.status === 200) {
        setBtcPrice(btcAxios.data.bitcoin.usd);
        setEthPrice(ethAxios.data.ethereum.usd);
      }
    }
    fetchPrice().then();
  }
  useEffect(() => {
    setTimeout(intervalFunc, 0);
    const interval = setInterval(intervalFunc, PRICE_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (stablePoolData && btcPoolData && ethPoolData) {
    const stableTvlUsd = formatToNumber(stablePoolData?.totalLockedUSD);
    const btcTvlUsd = formatToNumber(btcPoolData?.totalLocked) * btcPrice;
    const ethTvlUsd = formatToNumber(ethPoolData?.totalLocked) * ethPrice;
    const xNrvTvl = xNrvData?.totalLockedUSD;

    const swapPoolTvl = stableTvlUsd + btcTvlUsd + ethTvlUsd;
    const aggregateTvl = swapPoolTvl + xNrvTvl;

    return {
      xNrvTvl,
      swapPoolTvl,
      aggregateTvl,
    };
  } else {
    return {};
  }
}

function formatToNumber(bn) {
  return Number(formatUnits(bn));
}
