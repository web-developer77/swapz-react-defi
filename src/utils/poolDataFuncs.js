import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { One } from "@ethersproject/constants";

import { formatBNToPercentString } from "../utils";
import { NRVBTC_POOL_NAME, NRVETH_POOL_NAME } from "../constants";

export const MAX_BN_POW = BigNumber.from(10).pow(18);

export function getPriceMultiplier({ poolName, btcPrice, ethPrice }) {
  switch (poolName) {
    case NRVBTC_POOL_NAME:
      return btcPrice;
    case NRVETH_POOL_NAME:
      return ethPrice;
    default:
      return 1;
  }
}

export function calcBnSum(arr) {
  return arr.reduce((sum, b) => sum.add(b));
}

export function calcIfZero(lpb, balanceSum) {
  if (lpb.isZero()) {
    return One;
  } else {
    return balanceSum;
  }
}

export async function getBalanceInfo({ lpTokenContract, account }) {
  const arr = Promise.all([
    lpTokenContract.balanceOf(account || AddressZero),
    lpTokenContract.totalSupply(),
  ]);

  return arr;
}

export function getTokenBalanceInfo({ tokenBalances, state, poolName }) {
  const tokenBalancesSum = calcBnSum(tokenBalances);

  const priceMultiplier = getPriceMultiplier({ ...state, poolName });

  const tokenBalancesUSD = tokenBalancesSum?.mul(priceMultiplier ?? 0);

  return {
    tokenBalancesSum,
    tokenBalancesUSD,
  };
}

export function getPoolTokenInfoArr({
  poolTokenBalances,
  tokenBalances,
  totalLpTokenBalance,
  tokenBalancesSum,
  poolTokens,
}) {
  return poolTokens.map((token, i) => ({
    symbol: token.symbol,
    percent: formatBNToPercentString(
      tokenBalances[i]
        .mul(10 ** 5)
        .div(totalLpTokenBalance.isZero() ? One : tokenBalancesSum),
      5
    ),
    value: poolTokenBalances[i],
  }));
}
