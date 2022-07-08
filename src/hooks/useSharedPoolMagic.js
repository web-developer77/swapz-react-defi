import { useState, useEffect } from "react";

import { Zero } from "@ethersproject/constants";
import { parseUnits } from "@ethersproject/units";

import { POOLS_MAP } from "../constants";

import { useActiveWeb3React } from "../hooks/useActiveWeb3React";
import { usePoolTokenBalances } from "../hooks/useTokenBalances";
import { useTokenFormState } from "../hooks/useTokenFormState";

import { formatBNToString } from "../utils";
import { calculatePriceImpact } from "../utils/priceImpact";
import { getOnConfrimTransaction } from "../utils/stupid";

export function useSharedPoolMagic({
  poolName,
  poolData,
  swapContract,
  withdrawFormState,
  updateWithdrawFormState,
  approveAndDepositFunc,
  approveAndWithdrawFunc,
}) {
  const { account } = useActiveWeb3React();

  const poolTokens = POOLS_MAP[poolName];
  const [tokenFormState, updateTokenFormState] = useTokenFormState(poolTokens);
  const [estDepositLPTokenAmount, setEstDepositLPTokenAmount] = useState(Zero);
  const [priceImpact, setPriceImpact] = useState(Zero);
  const [estWithdrawBonus, setEstWithdrawBonus] = useState(Zero);

  useEffect(() => {
    // evaluate if a new deposit will exceed the pool's per-user limit
    async function calculateMaxDeposits() {
      if (swapContract === null || poolData === null || account === null) {
        setEstDepositLPTokenAmount(Zero);
        return;
      }
      const tokenInputSum = parseUnits(
        poolTokens
          .reduce(
            (sum, { symbol }) => sum + (+tokenFormState[symbol].valueRaw || 0),
            0
          )
          .toFixed(18),
        18
      );
      let depositLPTokenAmount;
      if (poolData.totalLocked.gt(0) && tokenInputSum.gt(0)) {
        depositLPTokenAmount = await swapContract.calculateTokenAmount(
          account,
          poolTokens.map(({ symbol }) => tokenFormState[symbol].valueSafe),
          true // deposit boolean
        );
      } else {
        // when pool is empty, estimate the lptokens by just summing the input instead of calling contract
        depositLPTokenAmount = tokenInputSum;
      }
      setEstDepositLPTokenAmount(depositLPTokenAmount);

      setPriceImpact(
        calculatePriceImpact(
          tokenInputSum,
          depositLPTokenAmount,
          poolData.virtualPrice
        )
      );
    }
    void calculateMaxDeposits();
  }, [poolData, tokenFormState, swapContract, account]);

  useEffect(() => {
    // evaluate if a new withdraw will exceed the pool's per-user limit
    async function calculateWithdrawBonus() {
      if (swapContract === null || poolData === null || account === null) {
        return;
      }
      const tokenInputSum = parseUnits(
        poolTokens
          .reduce(
            (sum, { symbol }) =>
              sum + (+withdrawFormState.tokenInputs[symbol].valueRaw || 0),
            0
          )
          .toFixed(18),
        18
      );
      let withdrawLPTokenAmount;
      if (poolData.totalLocked.gt(0) && tokenInputSum.gt(0)) {
        withdrawLPTokenAmount = await swapContract.calculateTokenAmount(
          account,
          poolTokens.map(
            ({ symbol }) => withdrawFormState.tokenInputs[symbol].valueSafe
          ),
          false
        );
      } else {
        // when pool is empty, estimate the lptokens by just summing the input instead of calling contract
        withdrawLPTokenAmount = tokenInputSum;
      }
      setEstWithdrawBonus(
        calculatePriceImpact(
          withdrawLPTokenAmount,
          tokenInputSum,
          poolData.virtualPrice
        )
      );
    }
    void calculateWithdrawBonus();
  }, [poolData, withdrawFormState, swapContract, account]);

  const tokenBalances = usePoolTokenBalances(poolName);

  const tokens = poolTokens.map(({ symbol, name, icon, decimals }) => ({
    symbol,
    name,
    icon,
    max: formatBNToString(tokenBalances[symbol], decimals),
    inputValue: tokenFormState[symbol].valueRaw,
  }));

  function onChangeTokenInputValue(symbol, value) {
    updateTokenFormState({ [symbol]: value });
  }

  const onConfirmTransaction = getOnConfrimTransaction({
    poolTokens,
    updateTokenFormState,
    tokenFormState,
    approveAndDepositFunc,
  });

  async function onConfirmWithdrawTransaction() {
    const { withdrawType, tokenInputs, lpTokenAmountToSpend } =
      withdrawFormState;
    await approveAndWithdrawFunc({
      tokenFormState: tokenInputs,
      infiniteApproval: false,
      withdrawType,
      lpTokenAmountToSpend,
    });
    updateWithdrawFormState({ fieldName: "reset", value: "reset" });
  }

  // useEffect(() => {
  //   updateWithdrawFormState({
  //     fieldName: 'withdrawType',
  //     value: 'ALL',
  //   })
  // }, [])

  return {
    estWithdrawBonus,
    onChangeTokenInputValue,
    onConfirmTransaction,
    onConfirmWithdrawTransaction,
    poolTokens,
    priceImpact,
    tokens,
  };
}
