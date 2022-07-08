import { useAnyContracts } from "../hooks/useContract";

import { useActiveWeb3React } from "../hooks/useActiveWeb3React";

export function useSwapOut() {
  const anyTokenContracts = useAnyContracts();
  const { account } = useActiveWeb3React();

  return async function swapOut({ fromSymbol, amount, toAddress }) {
    try {
      if (!account) throw new Error("Wallet must be connected");

      // For each token being deposited, check the allowance and approve it if necessary
      const tokenContract = anyTokenContracts?.[fromSymbol];
      if (tokenContract === null) return;
      const redeemTx = await tokenContract.Swapout(amount, toAddress);
      await redeemTx.wait();

      return Promise.resolve();
    } catch (err) {
      console.log(err);
    }
  };
}
