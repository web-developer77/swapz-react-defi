import { useContext } from "react";
import { formatUnits } from "@ethersproject/units";
import { Zero } from "@ethersproject/constants";

import { useMasterMindContract } from "../hooks/useContract";
import { useActiveWeb3React } from "../hooks/useActiveWeb3React";

import { Context } from "../store";

import {
  STABLE_SWAP_TOKEN,
  MASTERMIND_ADDRESSES,
  XNERVE_TOKEN,
  NRVBTC_SWAP_TOKEN,
  NRVETH_SWAP_TOKEN,
  NRV_BUSD_CAKE_TOKEN,
  FUSDT_SWAP_TOKEN,
  UST_SWAP_TOKEN,
} from "../constants";

export function usePoolAPYData() {
  const masterMindContract = useMasterMindContract();
  const { chainId } = useActiveWeb3React();
  const [state] = useContext(Context);

  async function getBscPoolInfo(poolIndex, poolTokenContract, account) {
    const poolInfo = await masterMindContract?.poolInfo(poolIndex);
    if (poolInfo?.allocPoint.eq(0)) {
      return {
        address: poolInfo?.lpToken,
        allocPoints: poolInfo?.allocPoint ?? 1,
        poolToken: null,
        stakedToken: null,
        userLPStaked: 0,
        lastRewardBlock: poolInfo?.lastRewardBlock,
      };
    }

    return {
      address: poolInfo?.lpToken,
      allocPoints: poolInfo?.allocPoint ?? 1,
      poolToken: poolTokenContract,
      lastRewardBlock: poolInfo?.lastRewardBlock,
    };
  }

  async function getMindPool(
    LPToken,
    poolInfo,
    totalAllocPoints,
    rewardsPerWeek,
    poolTokenContract
  ) {
    const poolRewardsPerWeek =
      (poolInfo.allocPoints / totalAllocPoints) * rewardsPerWeek;
    if (poolRewardsPerWeek === 0) return;
    let stakedTvl = 0;

    const busdBalanceNumber = state.cakeBUSDBalance;
    const nrvBalanceNumber = state.cakeNRVBalance;
    const nrvPriceUSDPrice = state.nrvPrice;

    const otherTokenSymbols = [
      STABLE_SWAP_TOKEN,
      NRVBTC_SWAP_TOKEN,
      NRVETH_SWAP_TOKEN,
      XNERVE_TOKEN,
      FUSDT_SWAP_TOKEN,
      UST_SWAP_TOKEN,
    ].map((token) => token.symbol);

    if (NRV_BUSD_CAKE_TOKEN.symbol === LPToken.symbol) {
      stakedTvl = nrvBalanceNumber * nrvPriceUSDPrice + busdBalanceNumber;
    } else if (otherTokenSymbols.includes(LPToken.symbol)) {
      const LPTokenBalance =
        (await poolTokenContract?.balanceOf(MASTERMIND_ADDRESSES[chainId])) ??
        Zero;

      const stakedTvlBaseCurrency = Number(
        formatUnits(LPTokenBalance, "ether")
      );

      if (
        LPToken.symbol === STABLE_SWAP_TOKEN.symbol ||
        LPToken.symbol === FUSDT_SWAP_TOKEN.symbol ||
        LPToken.symbol === UST_SWAP_TOKEN.symbol
      ) {
        stakedTvl = stakedTvlBaseCurrency;
      } else if (LPToken.symbol === NRVBTC_SWAP_TOKEN.symbol) {
        stakedTvl = stakedTvlBaseCurrency * state.btcPrice;
      } else if (LPToken.symbol === NRVETH_SWAP_TOKEN.symbol) {
        stakedTvl = stakedTvlBaseCurrency * state.ethPrice;
      } else if (LPToken.symbol === XNERVE_TOKEN.symbol) {
        stakedTvl = stakedTvlBaseCurrency * nrvPriceUSDPrice;
      }
    }

    const usdPerWeek = poolRewardsPerWeek * nrvPriceUSDPrice;

    const weeklyAPR = (usdPerWeek / stakedTvl) * 100;
    const weeklyAPRRounded = Math.round(weeklyAPR * 100) / 100;
    const yearlyAPRUnvested = Math.round(weeklyAPR * 52 * 100) / 100;
    const decimalAPR = yearlyAPRUnvested / 100;
    const compoundedUnvestedAPR =
      Math.round(100 * ((1 + decimalAPR / 365) ** 365 - 1) * 100) / 100;
    // const compoundedVestedAPR =
    //   Math.round(100 * ((1 + decimalAPR / 2) ** 2 - 1) * 100) / 100

    return {
      fullCompoundedAPY: Math.round(compoundedUnvestedAPR * 100) / 100,
      weeklyAPR: weeklyAPRRounded,
      yearlyAPRUnvested: yearlyAPRUnvested,
    };
  }

  return async function poolAPYData(localState) {
    let APYInfo;
    try {
      let [nervePerBlock, totalAllocPoints, poolInfo] = await Promise.all([
        masterMindContract?.nervePerBlock(),
        masterMindContract?.totalAllocPoint(),
        getBscPoolInfo(
          localState.poolId,
          localState.poolTokenContract,
          localState.account
        ),
      ]);
      nervePerBlock = nervePerBlock ?? Zero;
      const rewardsPerWeek =
        Number(formatUnits(nervePerBlock, "ether")) * 201600;

      APYInfo = await getMindPool(
        localState.poolToken,
        poolInfo,
        totalAllocPoints,
        rewardsPerWeek,
        localState.poolTokenContract
      );
    } catch (error) {
      console.error(error);
    }
    return APYInfo;
  };
}
