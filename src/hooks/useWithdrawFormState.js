import _ from "lodash";

import { useCallback, useState } from "react";

import { parseUnits } from "@ethersproject/units";
import { Zero } from "@ethersproject/constants";

import { POOLS_MAP } from "../constants";

import { useActiveWeb3React } from "../hooks/useActiveWeb3React";
import { usePoolData } from "../hooks/usePoolData";
import {
  useSwapContract,
  useMetaSwapDepositContract,
} from "../hooks/useContract";

import { numberInputStateCreator } from "../utils/numberInputState";

const IMBALANCE = "IMBALANCE";
const ALL = "ALL";

export function useWithdrawFormState(poolName, isMeta = false) {
  const poolTokens = POOLS_MAP[poolName];
  const basicSwapContract = useSwapContract(poolName); //? DIFF
  const metaSwapContract = useMetaSwapDepositContract(poolName);
  const [, userShareData] = usePoolData(poolName, isMeta);
  const { account } = useActiveWeb3React();

  let swapContract;
  if (isMeta) {
    swapContract = metaSwapContract;
  } else {
    swapContract = basicSwapContract;
  }

  const tokenInputStateCreators = poolTokens.reduce(
    (acc, { symbol, decimals }) => ({
      ...acc,
      [symbol]: numberInputStateCreator(decimals, Zero),
    }),
    {}
  );

  const tokenInputsEmptyState = poolTokens.reduce(
    (acc, { symbol }) => ({
      ...acc,
      [symbol]: tokenInputStateCreators[symbol](""),
    }),
    {}
  );

  const formEmptyState = {
    percentage: "",
    tokenInputs: tokenInputsEmptyState,
    withdrawType: ALL,
    error: null,
    lpTokenAmountToSpend: Zero,
  };

  const [formState, setFormState] = useState(formEmptyState);

  // TODO: resolve this, it's a little unsafe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateAndUpdateDynamicFields = useCallback(
    _.debounce(async (state) => {
      if (userShareData === null || swapContract === null || account === null)
        return;

      let percentageRaw;
      if (state.percentage === "") {
        percentageRaw = "0";
      } else if (state.percentage === null) {
        percentageRaw = "100";
      } else {
        percentageRaw = state.percentage;
      }

      // LP * % to be withdrawn
      const effectiveUserLPTokenBalance = userShareData.lpTokenBalance
        .mul(parseUnits(percentageRaw, 5)) // difference between numerator and denominator because we're going from 100 to 1.00
        .div(10 ** 7);

      // Use state.withdrawType to figure out which swap functions to use to calcuate next state
      let nextState;
      if (state.withdrawType === IMBALANCE) {
        try {
          const inputCalculatedLPTokenAmount =
            await swapContract.calculateTokenAmount(
              account,
              poolTokens.map(
                ({ symbol }) => state.tokenInputs[symbol].valueSafe
              ),
              false
            );
          if (inputCalculatedLPTokenAmount.gt(effectiveUserLPTokenBalance)) {
            nextState = {
              error: {
                field: "tokenInputs",
                message: "Insufficient balance.",
              },
              lpTokenAmountToSpend: Zero,
            };
          } else {
            nextState = {
              error: null,
              lpTokenAmountToSpend: inputCalculatedLPTokenAmount,
            };
          }
        } catch (e) {
          console.error(e);
          // calculateTokenAmount errors if amount exceeds amount in pool
          nextState = {
            error: {
              field: "tokenInputs",
              message: "Insufficient balance in pool.",
            },
            lpTokenAmountToSpend: Zero,
          };
        }
      } else if (state.withdrawType === ALL) {
        try {
          const tokenAmounts = await swapContract.calculateRemoveLiquidity(
            account,
            effectiveUserLPTokenBalance
          );
          nextState = {
            lpTokenAmountToSpend: effectiveUserLPTokenBalance,
            tokenInputs: poolTokens.reduce(
              (acc, { symbol }, i) => ({
                ...acc,
                [symbol]: tokenInputStateCreators[symbol](tokenAmounts[i]),
              }),
              {}
            ),
            error: null,
          };
        } catch {
          nextState = {
            error: {
              field: "tokenInputs",
              message: "Insufficient balance in pool.",
            },
          };
        }
      } else {
        try {
          if (state.percentage) {
            const tokenIndex = poolTokens.findIndex(
              ({ symbol }) => symbol === state.withdrawType
            );
            const tokenAmount =
              await swapContract.calculateRemoveLiquidityOneToken(
                account,
                effectiveUserLPTokenBalance, // lp token to be burnt
                tokenIndex
              ); // actual coin amount to be returned
            nextState = {
              lpTokenAmountToSpend: effectiveUserLPTokenBalance,
              tokenInputs: poolTokens.reduce(
                (acc, { symbol }, i) => ({
                  ...acc,
                  [symbol]: tokenInputStateCreators[symbol](
                    i === tokenIndex ? tokenAmount : "0"
                  ),
                }),
                {}
              ),
              error: null,
            };
          } else {
            // This branch addresses a user manually inputting a value for one token
            const inputCalculatedLPTokenAmount =
              await swapContract.calculateTokenAmount(
                account,
                poolTokens.map(
                  ({ symbol }) => state.tokenInputs[symbol].valueSafe
                ),
                false
              );
            nextState = inputCalculatedLPTokenAmount.gt(
              effectiveUserLPTokenBalance
            )
              ? {
                  error: {
                    field: "tokenInputs",
                    message: "Insufficient balance.",
                  },
                  lpTokenAmountToSpend: Zero,
                }
              : {
                  lpTokenAmountToSpend: inputCalculatedLPTokenAmount,
                  error: null,
                };
          }
        } catch {
          nextState = {
            error: {
              field: "tokenInputs",
              message: "Insufficient balance in pool.",
            },
          };
        }
      }
      setFormState((prevState) => ({
        ...prevState,
        ...nextState,
      }));
    }, 250),
    [userShareData, swapContract, poolTokens, tokenInputStateCreators]
  );

  const handleUpdateForm = useCallback(
    (action) => {
      // update the form with user input immediately
      // then call expensive debounced fn to update other fields
      setFormState((prevState) => {
        let nextState = {};
        if (action.fieldName === "tokenInputs") {
          const { tokenSymbol: tokenSymbolInput = "", value: valueInput } =
            action;
          const newTokenInputs = {
            ...prevState.tokenInputs,
            [tokenSymbolInput]:
              tokenInputStateCreators[tokenSymbolInput](valueInput),
          };
          const activeInputTokens = poolTokens.filter(
            ({ symbol }) => +newTokenInputs[symbol].valueRaw !== 0
          );
          let withdrawType;
          if (activeInputTokens.length === 0) {
            withdrawType = ALL;
          } else if (activeInputTokens.length === 1) {
            withdrawType = activeInputTokens[0].symbol;
          } else {
            withdrawType = IMBALANCE;
          }
          nextState = {
            withdrawType,
            lpTokenAmountToSpend: Zero,
            percentage: null,
            tokenInputs: newTokenInputs,
            error: null,
          };
        } else if (action.fieldName === "percentage") {
          const isInputInvalid =
            isNaN(+action.value) || +action.value < 0 || +action.value > 100;
          nextState = isInputInvalid
            ? {
                percentage: action.value,
                lpTokenAmountToSpend: Zero,
                error: { field: "percentage", message: "Invalid input" },
                tokenInputs: tokenInputsEmptyState,
              }
            : {
                withdrawType:
                  prevState.withdrawType === IMBALANCE
                    ? ALL
                    : prevState.withdrawType,
                percentage: action.value,
                error: null,
              };
        } else if (action.fieldName === "withdrawType") {
          nextState = {
            tokenInputs: tokenInputsEmptyState,
            percentage: prevState.percentage || "100",
            withdrawType: action.value,
            error: null,
          };
        } else if (action.fieldName === "reset") {
          nextState = formEmptyState;
        }
        const finalState = {
          ...prevState,
          ...nextState,
        };
        const pendingTokenInput =
          action.fieldName === "tokenInputs" &&
          poolTokens.every(({ symbol }) => {
            const stateValue = finalState.tokenInputs[symbol].valueRaw;
            return isNaN(+stateValue) || +stateValue === 0;
          });
        if (!finalState.error && !pendingTokenInput) {
          void calculateAndUpdateDynamicFields(finalState);
        }
        return finalState;
      });
    },
    [
      poolTokens,
      calculateAndUpdateDynamicFields,
      tokenInputStateCreators,
      tokenInputsEmptyState,
      formEmptyState,
    ]
  );

  return [formState, handleUpdateForm];
}
