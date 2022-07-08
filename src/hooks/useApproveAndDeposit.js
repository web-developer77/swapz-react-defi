import { BigNumber } from "@ethersproject/bignumber";

import { useToasts } from "react-toast-notifications";

import { useActiveWeb3React } from "../hooks/useActiveWeb3React";
import {
  useAllContracts,
  useSwapContract,
  useMetaSwapDepositContract,
} from "../hooks/useContract";

import { POOLS_MAP } from "../constants";

import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade";
import { subtractSlippage } from "../utils/slippage";

import BscScanToastLink from "../components/BscScanToastLink";

export function useApproveAndDeposit(poolName, isMeta = false) {
  const basicSwapContract = useSwapContract(poolName); //? DIFF
  const metaSwapContract = useMetaSwapDepositContract(poolName);
  const tokenContracts = useAllContracts();
  const { account } = useActiveWeb3React();
  const { addToast } = useToasts();

  let swapContract;
  if (isMeta) {
    swapContract = metaSwapContract;
  } else {
    swapContract = basicSwapContract;
  }

  const poolTokens = POOLS_MAP[poolName];
  if (!poolTokens)
    throw new Error("useApproveAndDeposit requires a valid pool name");

  return async function approveAndDeposit(state) {
    if (!account) throw new Error("Wallet must be connected");
    if (!swapContract) throw new Error("Swap contract is not loaded");

    const approveSingleToken = async (token) => {
      const spendingValue = BigNumber.from(
        state.tokenFormState[token.symbol].valueSafe
      );
      if (spendingValue.isZero()) return;
      const tokenContract = tokenContracts?.[token.symbol];
      if (tokenContract === null) return;
      await checkAndApproveTokenForTrade(
        tokenContract,
        swapContract.address,
        account,
        spendingValue,
        state.infiniteApproval,
        {
          onTransactionStart: () => {},
          onTransactionSuccess: () => {},
          onTransactionError: () => {
            throw new Error("Your transaction could not be completed");
          },
        }
      );
    };
    try {
      // For each token being deposited, check the allowance and approve it if necessary
      // await Promise.all(poolTokens.map((token) => approveSingleToken(token)))
      for (const token of poolTokens) {
        await approveSingleToken(token);
      }

      let minToMint;
      minToMint = await swapContract.calculateTokenAmount(
        account,
        poolTokens.map(({ symbol }) => state.tokenFormState[symbol].valueSafe),
        true // deposit boolean
      );

      minToMint = subtractSlippage(
        minToMint,
        state.slippageSelected,
        state.slippageCustom
      );

      const spendTransaction = await swapContract.addLiquidity(
        poolTokens.map(({ symbol }) => state.tokenFormState[symbol].valueSafe),
        minToMint,
        Math.round(new Date().getTime() / 1000 + 60 * 10)
      );

      const tx = await spendTransaction.wait();

      const toastContent = (
        <>
          Liquidity added!
          <br />
          <BscScanToastLink {...tx} />
        </>
      );

      addToast(toastContent, {
        appearance: "success",
        autoDismiss: true,
      });
      return Promise.resolve();
    } catch (e) {
      console.error(e);
      //   clearToasts()
      addToast("Unable to complete your transaction", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };
}
