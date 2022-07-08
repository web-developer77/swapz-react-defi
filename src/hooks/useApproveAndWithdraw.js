import { BigNumber } from "@ethersproject/bignumber";
import { formatUnits, parseUnits } from "@ethersproject/units";

import { useActiveWeb3React } from "../hooks/useActiveWeb3React";

import {
  useSwapContract,
  useLPTokenContract,
  useMetaSwapDepositContract,
  useMetaLPTokenContract,
} from "../hooks/useContract";

import { POOLS_MAP } from "../constants";
import { addSlippage, subtractSlippage } from "../utils/slippage";
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade";
import { getGasPrice } from "../utils/gas";

export function useApproveAndWithdraw(poolName, isMeta = false) {
  const { account } = useActiveWeb3React();
  const basicSwapContract = useSwapContract(poolName);
  const basicLpTokenContract = useLPTokenContract(poolName);
  const metaSwapContract = useMetaSwapDepositContract(poolName);
  const metaLpTokenContract = useMetaLPTokenContract(poolName);
  const poolTokens = POOLS_MAP[poolName];

  let swapContract;
  let lpTokenContract;
  if (isMeta) {
    swapContract = metaSwapContract;
    lpTokenContract = metaLpTokenContract;
  } else {
    swapContract = basicSwapContract;
    lpTokenContract = basicLpTokenContract;
  }

  if (!poolTokens)
    throw new Error("useApproveAndWithdraw requires a valid pool name");

  return async function approveAndWithdraw(state) {
    try {
      if (!account) throw new Error("Wallet must be connected");
      if (!swapContract) throw new Error("Swap contract is not loaded");
      if (state.lpTokenAmountToSpend.isZero()) return;
      if (lpTokenContract === null) return;
      const allowanceAmount =
        state.withdrawType === "IMBALANCE"
          ? addSlippage(
              state.lpTokenAmountToSpend,
              state.slippageSelected,
              state.slippageCustom
            )
          : state.lpTokenAmountToSpend;
      await checkAndApproveTokenForTrade(
        lpTokenContract,
        swapContract.address,
        account,
        allowanceAmount,
        state.infiniteApproval,
        {
          onTransactionStart: () => {},
          onTransactionSuccess: () => {},
          onTransactionError: () => {
            throw new Error("Your transaction could not be completed");
          },
        }
      );

      let gasPrice = getGasPrice(state.gasPriceSelected);

      gasPrice = parseUnits(gasPrice?.toString() || "45", "gwei");
      console.debug(
        `lpTokenAmountToSpend: ${formatUnits(state.lpTokenAmountToSpend, 18)}`
      );
      const inTenMinutes = Math.round(new Date().getTime() / 1000 + 60 * 10);
      let spendTransaction;
      if (state.withdrawType === "ALL") {
        spendTransaction = await swapContract.removeLiquidity(
          state.lpTokenAmountToSpend,
          poolTokens.map(({ symbol }) =>
            subtractSlippage(
              BigNumber.from(state.tokenFormState[symbol].valueSafe),
              state.slippageSelected,
              state.slippageCustom
            )
          ),
          inTenMinutes,
          { gasPrice }
        );
      } else if (state.withdrawType === "IMBALANCE") {
        spendTransaction = await swapContract.removeLiquidityImbalance(
          poolTokens.map(
            ({ symbol }) => state.tokenFormState[symbol].valueSafe
          ),
          addSlippage(
            state.lpTokenAmountToSpend,
            state.slippageSelected,
            state.slippageCustom
          ),
          inTenMinutes,
          { gasPrice }
        );
      } else {
        // state.withdrawType === [TokenSymbol]
        spendTransaction = await swapContract.removeLiquidityOneToken(
          state.lpTokenAmountToSpend,
          poolTokens.findIndex(({ symbol }) => symbol === state.withdrawType),
          subtractSlippage(
            BigNumber.from(
              state.tokenFormState[state.withdrawType || ""].valueSafe
            ),
            state.slippageSelected,
            state.slippageCustom
          ),
          inTenMinutes,
          { gasPrice }
        );
      }

      await spendTransaction.wait();
    } catch (e) {
      console.error(e);
      //   clearToasts()
    }
  };
}
