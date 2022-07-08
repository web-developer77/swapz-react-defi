import _ from "lodash";
import { parseUnits } from "@ethersproject/units";

import { useToasts } from "react-toast-notifications";
import { POOLS_MAP, METAPOOLS_MAP } from "../constants";
import { getGasPrice } from "../utils/gas";

import { useActiveWeb3React } from "../hooks/useActiveWeb3React";
import { useAllContracts, useMasterSwapContract } from "../hooks/useContract";

import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade";
import { subtractSlippage } from "../utils/slippage";

import BscScanToastLink from "../components/BscScanToastLink";

export function useApproveAndSwap(poolName) {
  const swapContract = useMasterSwapContract(poolName);
  const tokenContracts = useAllContracts();
  const { account } = useActiveWeb3React();
  const { addToast } = useToasts();

  const POOL_TOKENS = POOLS_MAP[poolName];
  if (!POOL_TOKENS) {
    throw new Error("useApproveAndSwap requires a valid pool name");
  }

  return async function approveAndSwap(state) {
    try {
      if (!account) throw new Error("Wallet must be connected");
      if (!swapContract) throw new Error("Swap contract is not loaded");

      // For each token being deposited, check the allowance and approve it if necessary
      const tokenContract = tokenContracts?.[state.fromTokenSymbol];
      if (tokenContract === null) return;

      await checkAndApproveTokenForTrade(
        tokenContract,
        swapContract.address,
        account,
        state.fromAmount,
        state.infiniteApproval,
        {
          onTransactionStart: () => {
            addToast(`Approving spend for ${state.fromTokenSymbol}`, {
              appearance: "info",
              autoDismiss: true,
            });
            return null;
          },
          onTransactionSuccess: (tx) => {
            const toastContent = (
              <>
                {`${state.fromTokenSymbol} spend approved`}
                <BscScanToastLink {...tx} />
              </>
            );
            addToast(toastContent, {
              appearance: "success",
              autoDismiss: true,
            });
            return null;
          },
          onTransactionError: () => {
            addToast(`Error in approving spend`, {
              appearance: "error",
              autoDismiss: true,
            });
            throw new Error("Your transaction could not be completed");
          },
        }
      );

      const minToMint = subtractSlippage(
        state.toAmount,
        state.slippageSelected,
        state.slippageCustom
      );

      let gasPrice = getGasPrice(state.gasPriceSelected);

      gasPrice = parseUnits(String(gasPrice) || "45", 9);
      const indexFrom = POOL_TOKENS.findIndex(
        ({ symbol }) => symbol === state.fromTokenSymbol
      );
      const indexTo = POOL_TOKENS.findIndex(
        ({ symbol }) => symbol === state.toTokenSymbol
      );

      const swapArgs = [
        indexFrom,
        indexTo,
        state.fromAmount,
        minToMint,
        Math.round(
          new Date().getTime() / 1000 + 60 * state.transactionDeadline
        ),
        {
          gasPrice,
        },
      ];

      let swapTransaction;
      if (_.keys(METAPOOLS_MAP).includes(poolName)) {
        swapTransaction = await swapContract.swapUnderlying(...swapArgs);
      } else {
        swapTransaction = await swapContract.swap(...swapArgs);
      }

      await swapTransaction.wait();

      return Promise.resolve();
    } catch (err) {
      console.log(err);
    }
  };
}
