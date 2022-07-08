import { useActiveWeb3React } from "../hooks/useActiveWeb3React";
import { formatUnits } from "@ethersproject/units";
import { Zero } from "@ethersproject/constants";

import {
  NRV,
  BUSD,
  NRV_BUSD_CAKE_V2_NEW_LP_TOKEN_ADDRESSES,
} from "../constants";
import { useTokenContract } from "../hooks/useContract";

export function useGetNRVPrice() {
  const { chainId } = useActiveWeb3React();

  const NRVContract = useTokenContract(NRV);
  const BUSDContract = useTokenContract(BUSD);

  return async function getNRVPrice() {
    let cakeNRVBalance, cakeBUSDBalance;
    try {
      cakeNRVBalance = await NRVContract?.balanceOf(
        NRV_BUSD_CAKE_V2_NEW_LP_TOKEN_ADDRESSES[chainId]
      );
      cakeBUSDBalance = await BUSDContract?.balanceOf(
        NRV_BUSD_CAKE_V2_NEW_LP_TOKEN_ADDRESSES[chainId]
      );
    } catch (e) {
      console.error(e);
    }
    cakeNRVBalance = cakeNRVBalance ?? Zero;
    cakeBUSDBalance = cakeBUSDBalance ?? Zero;

    const nrvBalanceString = formatUnits(cakeNRVBalance, "ether");
    const busdBalanceString = formatUnits(cakeBUSDBalance, "ether");

    const busdBalanceNumber = Number(busdBalanceString);
    const nrvBalanceNumber = Number(nrvBalanceString);
    const nrvPriceUSDPrice = busdBalanceNumber / nrvBalanceNumber;

    return {
      nrvPriceUSDPrice: nrvPriceUSDPrice,
      nrvBalanceNumber: nrvBalanceNumber,
      busdBalanceNumber: busdBalanceNumber,
    };
  };
}
