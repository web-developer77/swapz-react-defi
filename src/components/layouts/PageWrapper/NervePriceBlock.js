import { useEffect, useContext } from "react";
import axios from "axios";

import { useGetNRVPrice } from "../../../hooks/useGetNRVPrice";
import { Context } from "../../../store";

const PRICE_UPDATE_INTERVAL = 10000;

export default function NervePriceBlock() {
  const [state, dispatch] = useContext(Context);
  const getNRVPrice = useGetNRVPrice();

  useEffect(() => {
    function intervalFunc() {
      async function fetchPrice() {
        const priceData = await getNRVPrice();

        dispatch({
          type: "SET_NRV_PRICE",
          payload: priceData.nrvPriceUSDPrice,
        });
        dispatch({
          type: "SET_BUSD_CAKE_BALANCE",
          payload: priceData.busdBalanceNumber,
        });
        dispatch({
          type: "SET_NRV_CAKE_BALANCE",
          payload: priceData.nrvBalanceNumber,
        });
        const [btcAxios, ethAxios] = await Promise.all([
          axios(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=USD"
          ),
          axios(
            "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=USD"
          ),
        ]);
        if (btcAxios.status === 200 && ethAxios.status === 200) {
          dispatch({
            type: "SET_BTC_PRICE",
            payload: btcAxios.data.bitcoin.usd,
          });
          dispatch({
            type: "SET_ETH_PRICE",
            payload: Math.round(ethAxios.data.ethereum.usd),
          });
        }
      }
      fetchPrice().then();
    }
    setTimeout(intervalFunc, 0);
    const interval = setInterval(intervalFunc, PRICE_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-block">
      <p className="text-sm font-medium text-default">
        NRV: ${Math.round(state.nrvPrice * 10000) / 10000}
      </p>
    </div>
  );
}
