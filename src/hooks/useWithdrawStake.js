import { useToasts } from "react-toast-notifications";

import { useActiveWeb3React } from "../hooks/useActiveWeb3React";
import { useMasterMindContract } from "../hooks/useContract";

import BscScanToastLink from "../components/BscScanToastLink";

export function useWithdrawStake() {
  // const tokenContracts = useAllContracts();
  const { account } = useActiveWeb3React();
  const { addToast } = useToasts();

  const masterMindContract = useMasterMindContract();

  return async function withdrawStake(state) {
    if (!account) throw new Error("Wallet must be connected");
    if (!masterMindContract) throw new Error("MMind contract is not loaded");

    const stakeTransaction = await masterMindContract.withdraw(
      state.poolId,
      state.amount
    );

    const tx = await stakeTransaction.wait();

    const toastContent = (
      <>
        {"Withdraw completed: "}
        <BscScanToastLink {...tx} />
      </>
    );

    addToast(toastContent, {
      appearance: "success",
      autoDismiss: true,
    });

    return Promise.resolve();
  };
}
