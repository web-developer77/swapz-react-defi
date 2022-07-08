import _ from "lodash";

import { useEffect, useState, useContext } from "react";

import { AddressZero } from "@ethersproject/constants";
import { BigNumber } from "@ethersproject/bignumber";

import {
  POOLS_MAP,
  METAPOOLS_MAP,
  STAKING_MAP,
  STAKING_MAP_TOKENS,
  RUSD_POOL_NAME,
} from "../constants";

// import LPTOKEN_ABI from "@constants/abis/lpToken.json";

import { Context } from "../store";

import { useActiveWeb3React } from "../hooks/useActiveWeb3React";
import { usePoolAPYData } from "../hooks/usePoolAPYData";
import {
  useAllContracts,
  useSwapContract,
  useMetaSwapContract,
} from "../hooks/useContract";

import { getContract } from "../utils";

import {
  calcBnSum,
  calcIfZero,
  getBalanceInfo,
  getTokenBalanceInfo,
  getPoolTokenInfoArr,
  MAX_BN_POW,
} from "../utils/poolDataFuncs";

export function usePoolData(poolName, isMeta = false) {
  const { account, library } = useActiveWeb3React();
  const basicSwapContract = useSwapContract(poolName); //? DIFF
  const metaSwapContract = useMetaSwapContract(poolName); //? DIFF
  const tokenContracts = useAllContracts();
  const [userPoolData, setUserPoolData] = useState(null);
  const [poolData, setPoolData] = useState(null);
  const [state] = useContext(Context);

  const poolAPYData = usePoolAPYData();

  const poolId = STAKING_MAP[poolName];
  const apyToken = STAKING_MAP_TOKENS[poolName];

  // Conditionally Swap Contracts
  let poolTokens;
  let swapContract;
  if (isMeta) {
    swapContract = metaSwapContract;
    poolTokens = METAPOOLS_MAP[poolName];
  } else {
    swapContract = basicSwapContract;
    poolTokens = POOLS_MAP[poolName];
  }

  async function getSwapData() {
    if (
      _.some([poolName, swapContract, tokenContracts, library].map(_.isNull))
    ) {
      return;
    }

    // Launch Requests upfront to save time...
    const swapStorageRequest = swapContract.swapStorage();
    const userCurrentWithdrawFeeRequest =
      swapContract.calculateCurrentWithdrawFee(account || AddressZero);
    const virtualPriceRequest = swapContract.getVirtualPrice();

    const rawTokenBalancesRequest = Promise.all(
      poolTokens.map((token, i) => swapContract.getTokenBalance(i))
    );

    // Swap fees, price, and LP Token data
    const { adminFee, defaultDepositFee, lpToken, swapFee } =
      await swapStorageRequest;

    const lpTokenContract = getContract(lpToken, library);

    const poolApyRequest = poolAPYData({
      account,
      poolId,
      poolToken: apyToken,
      poolTokenContract: lpTokenContract,
    });

    const [userLpTokenBalance, totalLpTokenBalance] = await getBalanceInfo({
      lpTokenContract,
      account,
    });

    const virtualPrice = totalLpTokenBalance.isZero()
      ? MAX_BN_POW
      : await virtualPriceRequest;

    // Pool token data
    const rawTokenBalances = await rawTokenBalancesRequest;

    const tokenBalances = _.zip(poolTokens, rawTokenBalances).map(
      ([token, rawBalance]) =>
        BigNumber.from(10)
          .pow(18 - token.decimals) // cast all to 18 decimals
          .mul(rawBalance)
    );

    const { tokenBalancesSum, tokenBalancesUSD } = getTokenBalanceInfo({
      tokenBalances,
      state,
      poolName,
    });
    // (weeksPerYear * KEEPPerWeek * KEEPPrice) / (BTCPrice * BTCInPool)

    // User share data
    const userShare = userLpTokenBalance
      .mul(MAX_BN_POW)
      .div(calcIfZero(totalLpTokenBalance, totalLpTokenBalance));

    const userPoolTokenBalances = tokenBalances.map((balance) =>
      userShare.mul(balance).div(MAX_BN_POW)
    );

    const userPoolTokenBalancesSum = calcBnSum(userPoolTokenBalances);

    const sharedArgs = {
      tokenBalances,
      totalLpTokenBalance,
      tokenBalancesSum,
      poolTokens,
    };

    const generalPoolTokens = getPoolTokenInfoArr({
      poolTokenBalances: tokenBalances,
      ...sharedArgs,
    });

    const userPoolTokens = getPoolTokenInfoArr({
      poolTokenBalances: userPoolTokenBalances,
      ...sharedArgs,
    });

    let apy;
    if (isMeta) {
      if (poolName !== RUSD_POOL_NAME) {
        apy = await poolApyRequest;
      } else {
        apy = undefined;
      }
    } else {
      apy = await poolApyRequest;
    }

    const poolDataObj = {
      name: poolName,
      tokens: generalPoolTokens,
      totalLocked: tokenBalancesSum,
      totalLockedUSD: tokenBalancesUSD,
      virtualPrice: virtualPrice,
      adminFee: adminFee,
      defaultDepositFee: defaultDepositFee,
      swapFee: swapFee,
      volume: "XXX", // TODO
      utilization: "XXX", // TODO
      apy: apy, //? DIFF
    };

    let userShareData;
    if (account) {
      userShareData = {
        name: poolName,
        share: userShare,
        value: userPoolTokenBalancesSum,
        avgBalance: userPoolTokenBalancesSum,
        tokens: userPoolTokens,
        currentWithdrawFee: await userCurrentWithdrawFeeRequest,
        lpTokenBalance: userLpTokenBalance,
        // the code was always doing this, i could not find out why
        lpTokenMinted: userLpTokenBalance,
      };
    } else {
      userShareData = null;
    }

    setPoolData(poolDataObj);
    setUserPoolData(userShareData);
  }

  useEffect(() => {
    try {
      getSwapData();
    } catch (error) {
      // console.log({error})
    }
  }, [poolName, swapContract, tokenContracts, account, library, state]);

  return [poolData, userPoolData];
}
